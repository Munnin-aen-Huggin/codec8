import { supabaseAdmin } from './supabase';
import { nanoid } from 'nanoid';
import type { Team, TeamMember, TeamInvitation } from '$lib/types';

// Create a new team
export async function createTeam(
	userId: string,
	name: string
): Promise<Team> {
	const slug = generateSlug(name);

	const { data, error } = await supabaseAdmin
		.from('teams')
		.insert({
			name,
			slug,
			owner_id: userId
		})
		.select()
		.single();

	if (error) throw error;
	return data;
}

// Get user's teams
export async function getUserTeams(userId: string): Promise<Team[]> {
	const { data, error } = await supabaseAdmin
		.from('team_members')
		.select('teams(*)')
		.eq('user_id', userId);

	if (error) throw error;
	return (data || []).map((d: { teams: Team | null }) => d.teams).filter((t): t is Team => t !== null);
}

// Get team by ID with members
export async function getTeamWithMembers(
	teamId: string,
	userId: string
): Promise<{ team: Team; members: TeamMember[]; isAdmin: boolean }> {
	// Check membership
	const { data: membership } = await supabaseAdmin
		.from('team_members')
		.select('role')
		.eq('team_id', teamId)
		.eq('user_id', userId)
		.single();

	if (!membership) {
		throw new Error('Not a member of this team');
	}

	// Get team
	const { data: team, error: teamError } = await supabaseAdmin
		.from('teams')
		.select('*')
		.eq('id', teamId)
		.single();

	if (teamError) throw teamError;

	// Get members with profiles
	const { data: members, error: membersError } = await supabaseAdmin
		.from('team_members')
		.select(`
			*,
			profiles:user_id (
				id,
				email,
				github_username
			)
		`)
		.eq('team_id', teamId)
		.order('joined_at', { ascending: true });

	if (membersError) throw membersError;

	return {
		team,
		members: (members || []).map((m: TeamMember & { profiles: { id: string; email: string; github_username: string } | null }) => ({
			...m,
			profile: m.profiles
		})),
		isAdmin: membership.role === 'owner' || membership.role === 'admin'
	};
}

// Create invitation
export async function createInvitation(
	teamId: string,
	email: string,
	role: 'admin' | 'member',
	invitedBy: string
): Promise<TeamInvitation> {
	// Check seat limit
	const { data: team } = await supabaseAdmin
		.from('teams')
		.select('max_seats')
		.eq('id', teamId)
		.single();

	const { count: memberCount } = await supabaseAdmin
		.from('team_members')
		.select('*', { count: 'exact', head: true })
		.eq('team_id', teamId);

	const { count: pendingCount } = await supabaseAdmin
		.from('team_invitations')
		.select('*', { count: 'exact', head: true })
		.eq('team_id', teamId)
		.is('accepted_at', null);

	if ((memberCount || 0) + (pendingCount || 0) >= (team?.max_seats || 5)) {
		throw new Error('Team has reached maximum seats');
	}

	// Check if already a member
	const { data: existingProfile } = await supabaseAdmin
		.from('profiles')
		.select('id')
		.eq('email', email)
		.single();

	if (existingProfile) {
		const { data: existingMember } = await supabaseAdmin
			.from('team_members')
			.select('id')
			.eq('team_id', teamId)
			.eq('user_id', existingProfile.id)
			.single();

		if (existingMember) {
			throw new Error('User is already a team member');
		}
	}

	// Create invitation with unique token
	const token = nanoid(32);

	const { data, error } = await supabaseAdmin
		.from('team_invitations')
		.insert({
			team_id: teamId,
			email: email.toLowerCase(),
			role,
			invited_by: invitedBy,
			token
		})
		.select()
		.single();

	if (error) {
		if (error.code === '23505') {
			throw new Error('An invitation has already been sent to this email');
		}
		throw error;
	}

	return data;
}

// Accept invitation
export async function acceptInvitation(
	token: string,
	userId: string
): Promise<{ team: Team; role: string }> {
	// Get invitation
	const { data: invitation, error: invError } = await supabaseAdmin
		.from('team_invitations')
		.select('*, teams(*)')
		.eq('token', token)
		.is('accepted_at', null)
		.single();

	if (invError || !invitation) {
		throw new Error('Invalid or expired invitation');
	}

	if (new Date(invitation.expires_at) < new Date()) {
		throw new Error('Invitation has expired');
	}

	// Verify email matches
	const { data: profile } = await supabaseAdmin
		.from('profiles')
		.select('email')
		.eq('id', userId)
		.single();

	if (profile?.email?.toLowerCase() !== invitation.email.toLowerCase()) {
		throw new Error('This invitation was sent to a different email address');
	}

	// Add member
	const { error: memberError } = await supabaseAdmin
		.from('team_members')
		.insert({
			team_id: invitation.team_id,
			user_id: userId,
			role: invitation.role
		});

	if (memberError) {
		if (memberError.code === '23505') {
			throw new Error('You are already a member of this team');
		}
		throw memberError;
	}

	// Mark invitation as accepted
	await supabaseAdmin
		.from('team_invitations')
		.update({ accepted_at: new Date().toISOString() })
		.eq('id', invitation.id);

	return { team: invitation.teams, role: invitation.role };
}

// Get pending invitations for team
export async function getTeamInvitations(
	teamId: string
): Promise<TeamInvitation[]> {
	const { data, error } = await supabaseAdmin
		.from('team_invitations')
		.select('*')
		.eq('team_id', teamId)
		.is('accepted_at', null)
		.gt('expires_at', new Date().toISOString())
		.order('created_at', { ascending: false });

	if (error) throw error;
	return data || [];
}

// Cancel invitation
export async function cancelInvitation(invitationId: string): Promise<void> {
	const { error } = await supabaseAdmin
		.from('team_invitations')
		.delete()
		.eq('id', invitationId);

	if (error) throw error;
}

// Remove team member
export async function removeTeamMember(
	teamId: string,
	memberId: string,
	removedBy: string
): Promise<void> {
	// Can't remove owner
	const { data: member } = await supabaseAdmin
		.from('team_members')
		.select('role, user_id')
		.eq('id', memberId)
		.single();

	if (member?.role === 'owner') {
		throw new Error('Cannot remove team owner');
	}

	// Check remover is admin
	const { data: remover } = await supabaseAdmin
		.from('team_members')
		.select('role')
		.eq('team_id', teamId)
		.eq('user_id', removedBy)
		.single();

	if (remover?.role !== 'owner' && remover?.role !== 'admin') {
		throw new Error('Only team admins can remove members');
	}

	const { error } = await supabaseAdmin
		.from('team_members')
		.delete()
		.eq('id', memberId);

	if (error) throw error;
}

// Leave team
export async function leaveTeam(
	teamId: string,
	userId: string
): Promise<void> {
	const { data: member } = await supabaseAdmin
		.from('team_members')
		.select('role')
		.eq('team_id', teamId)
		.eq('user_id', userId)
		.single();

	if (member?.role === 'owner') {
		throw new Error('Team owner cannot leave. Transfer ownership or delete the team.');
	}

	const { error } = await supabaseAdmin
		.from('team_members')
		.delete()
		.eq('team_id', teamId)
		.eq('user_id', userId);

	if (error) throw error;
}

// Update member role
export async function updateMemberRole(
	memberId: string,
	newRole: 'admin' | 'member',
	updatedBy: string
): Promise<void> {
	const { data: member } = await supabaseAdmin
		.from('team_members')
		.select('team_id, role')
		.eq('id', memberId)
		.single();

	if (!member) throw new Error('Member not found');
	if (member.role === 'owner') throw new Error('Cannot change owner role');

	// Check updater is owner or admin
	const { data: updater } = await supabaseAdmin
		.from('team_members')
		.select('role')
		.eq('team_id', member.team_id)
		.eq('user_id', updatedBy)
		.single();

	if (updater?.role !== 'owner' && updater?.role !== 'admin') {
		throw new Error('Only team admins can change roles');
	}

	const { error } = await supabaseAdmin
		.from('team_members')
		.update({ role: newRole })
		.eq('id', memberId);

	if (error) throw error;
}

// Helper: generate slug from name
function generateSlug(name: string): string {
	const base = name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
	return `${base}-${nanoid(6)}`;
}
