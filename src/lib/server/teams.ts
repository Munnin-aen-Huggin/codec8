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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (data || []).map((d: any) => d.teams).filter((t: Team | null): t is Team => t !== null);
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
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		members: (members || []).map((m: any) => ({
			...m,
			profile: m.profiles || undefined
		})) as TeamMember[],
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
	// Check seat limit (including addon extra seats)
	const { data: team } = await supabaseAdmin
		.from('teams')
		.select('max_seats, addon_extra_seats, addon_extra_seats_expires')
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

	// Calculate effective seat limit including addons
	const baseSeats = team?.max_seats || 5;
	const addonSeats = team?.addon_extra_seats || 0;
	const addonSeatsValid = !team?.addon_extra_seats_expires ||
		new Date(team.addon_extra_seats_expires) > new Date();
	const effectiveSeats = baseSeats + (addonSeatsValid ? addonSeats : 0);

	if ((memberCount || 0) + (pendingCount || 0) >= effectiveSeats) {
		throw new Error(`Team has reached maximum seats (${effectiveSeats}). Purchase additional seats to invite more members.`);
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

// ============================================
// SSO JIT Provisioning Functions
// ============================================

export interface SSOUserData {
	nameId: string;
	email: string;
	firstName?: string;
	lastName?: string;
	groups?: string[];
	provider: string;
}

/**
 * Provision a new user via SSO JIT (Just-in-Time) provisioning
 */
export async function provisionSSOUser(
	ssoData: SSOUserData,
	teamId: string
): Promise<string> {
	const newUserId = crypto.randomUUID();

	// Construct display name
	const displayName = ssoData.firstName && ssoData.lastName
		? `${ssoData.firstName} ${ssoData.lastName}`
		: ssoData.email.split('@')[0];

	const { error: insertError } = await supabaseAdmin
		.from('profiles')
		.insert({
			id: newUserId,
			email: ssoData.email.toLowerCase(),
			github_username: displayName.replace(/\s+/g, '-').toLowerCase(),
			sso_id: ssoData.nameId,
			sso_provider: ssoData.provider,
			sso_team_id: teamId,
			plan: 'free'
		});

	if (insertError) {
		console.error('[JIT Provisioning] Failed to create user:', insertError);
		throw new Error('Failed to create user account via SSO');
	}

	return newUserId;
}

/**
 * Add a user to a team via SSO (bypasses invitation system)
 */
export async function addUserToTeamViaSso(
	userId: string,
	teamId: string,
	role: 'member' | 'admin' = 'member'
): Promise<void> {
	// Check if already a member
	const { data: existingMembership } = await supabaseAdmin
		.from('team_members')
		.select('id')
		.eq('team_id', teamId)
		.eq('user_id', userId)
		.single();

	if (existingMembership) {
		// Already a member, no action needed
		return;
	}

	// Check seat limit (SSO users still count against seat limit)
	const { data: team } = await supabaseAdmin
		.from('teams')
		.select('max_seats, addon_extra_seats, addon_extra_seats_expires')
		.eq('id', teamId)
		.single();

	const { count: memberCount } = await supabaseAdmin
		.from('team_members')
		.select('*', { count: 'exact', head: true })
		.eq('team_id', teamId);

	// Calculate effective seat limit
	const baseSeats = team?.max_seats || 5;
	const addonSeats = team?.addon_extra_seats || 0;
	const addonSeatsValid = !team?.addon_extra_seats_expires ||
		new Date(team.addon_extra_seats_expires) > new Date();
	const effectiveSeats = baseSeats + (addonSeatsValid ? addonSeats : 0);

	if ((memberCount || 0) >= effectiveSeats) {
		throw new Error('Team has reached maximum seats. Contact your administrator.');
	}

	// Add to team
	const { error } = await supabaseAdmin
		.from('team_members')
		.insert({
			team_id: teamId,
			user_id: userId,
			role
		});

	if (error) {
		console.error('[JIT Provisioning] Failed to add user to team:', error);
		throw new Error('Failed to add user to team via SSO');
	}
}

/**
 * Link existing user to SSO
 */
export async function linkUserToSSO(
	userId: string,
	ssoData: SSOUserData,
	teamId: string
): Promise<void> {
	const { error } = await supabaseAdmin
		.from('profiles')
		.update({
			sso_id: ssoData.nameId,
			sso_provider: ssoData.provider,
			sso_team_id: teamId
		})
		.eq('id', userId);

	if (error) {
		console.error('[SSO Link] Failed to link user to SSO:', error);
		throw new Error('Failed to link account to SSO');
	}
}

/**
 * Check if a team requires SSO for login
 */
export async function checkTeamSSORequirement(
	teamId: string
): Promise<{ requiresSso: boolean; ssoUrl?: string }> {
	const { data: team, error } = await supabaseAdmin
		.from('teams')
		.select('sso_required, slug')
		.eq('id', teamId)
		.single();

	if (error || !team) {
		return { requiresSso: false };
	}

	if (!team.sso_required) {
		return { requiresSso: false };
	}

	// SSO is required, provide the login URL
	return {
		requiresSso: true,
		ssoUrl: `/auth/sso?team=${team.slug}`
	};
}

/**
 * Find user's SSO team (for enforcing SSO login)
 */
export async function getUserSSOTeam(
	userId: string
): Promise<{ teamId: string; teamSlug: string; ssoRequired: boolean } | null> {
	const { data: profile, error } = await supabaseAdmin
		.from('profiles')
		.select(`
			sso_team_id,
			teams:sso_team_id (
				id,
				slug,
				sso_required
			)
		`)
		.eq('id', userId)
		.single();

	if (error || !profile?.sso_team_id) {
		return null;
	}

	// Handle the joined data
	const teamData = profile.teams as unknown as { id: string; slug: string; sso_required: boolean } | null;

	if (!teamData) {
		return null;
	}

	return {
		teamId: teamData.id,
		teamSlug: teamData.slug,
		ssoRequired: teamData.sso_required || false
	};
}

/**
 * Map SSO groups to team roles
 */
export function mapSSOGroupsToRole(
	groups: string[] | undefined,
	attributeMapping?: { adminGroups?: string[] }
): 'admin' | 'member' {
	if (!groups || !attributeMapping?.adminGroups) {
		return 'member';
	}

	// Check if user is in any admin group
	const isAdmin = groups.some(group =>
		attributeMapping.adminGroups?.includes(group)
	);

	return isAdmin ? 'admin' : 'member';
}
