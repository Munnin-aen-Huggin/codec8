# Launch Day Runbook

## Overview

This runbook provides a step-by-step checklist for Codec8's launch day, covering timing, monitoring, community engagement, and incident response.

**Target Launch Day:** Tuesday-Thursday (best PH visibility)
**Launch Time:** 12:01 AM PST (8:01 AM UTC)

---

## Pre-Launch (Day Before)

### Technical Preparation
- [ ] Run full test suite: `npm run test:unit`
- [ ] Build production: `npm run build`
- [ ] Verify production deployment on Vercel
- [ ] Test critical paths manually:
  - [ ] GitHub OAuth login
  - [ ] Repository connection
  - [ ] Documentation generation
  - [ ] Stripe checkout flow
- [ ] Check Supabase connection pool limits
- [ ] Verify Anthropic API rate limits and quotas
- [ ] Clear any test data from production

### Content Preparation
- [ ] Product Hunt submission finalized
- [ ] All platform copy ready (from `launch-copy.md`)
- [ ] Demo video uploaded
- [ ] Screenshots uploaded
- [ ] Social media accounts logged in

### Monitoring Setup
- [ ] Enable Vercel Analytics
- [ ] Set up error monitoring (Sentry or LogRocket)
- [ ] Create uptime monitoring (UptimeRobot or Vercel)
- [ ] Open terminal with `vercel logs --follow`
- [ ] Bookmark important dashboards:
  - Vercel Dashboard
  - Supabase Dashboard
  - Stripe Dashboard (watch for payments!)

---

## Launch Timeline

### T-1 hour (11:00 PM PST)
- [ ] Final production deployment check
- [ ] Verify all environment variables set
- [ ] Test one more doc generation
- [ ] Open all monitoring dashboards

### T-0 (12:01 AM PST)
- [ ] Submit Product Hunt (if not pre-scheduled)
- [ ] Verify PH listing is live
- [ ] Like and comment as maker

### T+15 minutes
- [ ] Post Hacker News (Show HN)
- [ ] Check HN submission is live at /newest

### T+30 minutes
- [ ] Post Twitter thread
- [ ] Schedule remaining tweets if using Buffer/Tweet Hunter

### T+1 hour
- [ ] Post Reddit (r/SideProject, r/webdev)
- [ ] Join Discord communities and share
- [ ] Check LinkedIn post engagement

### T+2 hours
- [ ] First response check:
  - [ ] Product Hunt comments
  - [ ] Hacker News comments
  - [ ] Twitter replies
  - [ ] Reddit comments
- [ ] Send beta user email

---

## Monitoring During Launch

### Key Metrics to Watch

| Metric | Tool | Action Threshold |
|--------|------|------------------|
| Error rate | Vercel logs | > 5% errors |
| Response time | Vercel | > 3s average |
| Database connections | Supabase | > 80% pool |
| API costs | Anthropic | > $50/hour |
| Stripe payments | Dashboard | Any failed payments |

### Health Checks (Every 30 min for first 4 hours)
1. Visit homepage - does it load?
2. Click "Start Free" - does OAuth work?
3. Check dashboard loads (if logged in)
4. Monitor error logs

### Response Time Budget
- **Product Hunt comments:** < 10 minutes
- **Hacker News comments:** < 15 minutes
- **Twitter mentions:** < 30 minutes
- **Email inquiries:** < 2 hours

---

## Community Engagement

### Product Hunt Comments
Use templates from `product-hunt-submission.md`:

**Thank you responses:**
```
Thanks [name]! Really appreciate the support. Let me know if you have any questions about the lifetime deal.
```

**Feature requests:**
```
Great suggestion! I've added this to our roadmap. We're focused on [current priority] first, but [feature] is definitely coming.
```

**Skeptical comments:**
```
Fair point! Here's what makes us different: [specific differentiator]. Happy to do a live demo if you want to see it in action.
```

### Hacker News Comments
- Stay factual and technical
- Don't be defensive
- Answer specific technical questions in depth
- Avoid marketing speak

### Twitter Engagement
- Like and reply to positive mentions
- Retweet user testimonials (with permission)
- Answer DMs promptly

---

## Incident Response

### Severity Levels

| Level | Description | Response |
|-------|-------------|----------|
| P0 | Site down / All users affected | Drop everything, fix immediately |
| P1 | Core feature broken | Fix within 1 hour |
| P2 | Non-critical bug | Fix within 4 hours |
| P3 | Minor issue | Track for later |

### P0 Response Playbook

1. **Acknowledge** (< 5 min)
   - Post status update: "We're aware of an issue and investigating"
   - Twitter, PH comment, HN

2. **Diagnose** (< 15 min)
   - Check Vercel deployment logs
   - Check Supabase status
   - Check Anthropic API status
   - Check Stripe status

3. **Mitigate** (< 30 min)
   - Roll back to previous deployment if needed: `vercel rollback`
   - Enable maintenance mode if needed
   - Scale Supabase if database issue

4. **Resolve**
   - Deploy fix
   - Test in production
   - Post resolution update

5. **Post-mortem** (within 24 hours)
   - Document what happened
   - Identify root cause
   - Implement preventive measures

### Quick Rollback Commands
```bash
# View recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback

# Promote a specific deployment
vercel promote [deployment-url]
```

---

## Quick Response Templates

### Technical Issues
```
We're seeing this too and actively working on a fix. Should be resolved in the next [X] minutes. Thanks for your patience!
```

### Payment Issues
```
I see your payment but there seems to be a sync issue. Let me fix that for you right now. You'll have access within 5 minutes.
```

### Feature Questions
```
Great question! [Answer]. Let me know if you need any other details.
```

### Pricing Questions
```
The Lifetime Deal is $99 one-time for unlimited repos forever. No subscriptions. The Pro tier at $497 includes a 30-min onboarding call where I'll set everything up with you.
```

---

## End of Day Checklist

### 4 Hours Post-Launch
- [ ] Review all comments and respond
- [ ] Check for any bug reports
- [ ] Review analytics for traffic patterns
- [ ] Post a thank you update on PH

### 8 Hours Post-Launch
- [ ] Summarize feedback received
- [ ] Prioritize any bugs/issues found
- [ ] Review conversion metrics
- [ ] Check revenue numbers

### 24 Hours Post-Launch
- [ ] Full metrics review
- [ ] Lessons learned document
- [ ] Plan Day 2 activities
- [ ] Thank beta users again

---

## Emergency Contacts

- **Vercel Support:** vercel.com/support
- **Supabase Support:** supabase.com/support
- **Stripe Support:** dashboard.stripe.com/support
- **Anthropic Support:** support.anthropic.com

---

## Success Metrics

### Day 1 Targets
- [ ] 100+ Product Hunt upvotes
- [ ] Top 5 Product of the Day
- [ ] 500+ website visitors
- [ ] 50+ signups
- [ ] 5+ paying customers

### Week 1 Targets
- [ ] 1,000+ signups
- [ ] 50+ paying customers
- [ ] $5,000+ revenue
- [ ] < 3 critical bugs

---

*Last Updated: 2026-01-12*
*Phase: 05-pre-launch*
