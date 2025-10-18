// Utilities to compute profile completion for different roles

export function computeJobSeekerCompletion(user) {
  if (!user) return { percent: 0, missing: ['account'] };

  const u = user;
  const profile = u.profile || {};

  // Define required and optional fields
  const checks = [
    { key: 'name', ok: !!u.name, label: 'Name' },
    { key: 'email', ok: !!u.email, label: 'Email' },
    { key: 'phone', ok: !!u.phone, label: 'Phone' },
    { key: 'location', ok: !!u.location, label: 'Location' },
    { key: 'resume', ok: !!profile.resume?.path, label: 'Resume' },
  ];

  // Bonus fields to push toward 100%
  const bonus = [
    { key: 'skills', ok: Array.isArray(profile.skills) && profile.skills.length > 0, label: 'Skills' },
    { key: 'experienceLevel', ok: !!profile.experienceLevel, label: 'Experience level' },
    { key: 'yearsOfExperience', ok: typeof profile.yearsOfExperience === 'number', label: 'Years of experience' },
    { key: 'preferredLocations', ok: Array.isArray(profile.preferredLocations) && profile.preferredLocations.length > 0, label: 'Preferred locations' },
  ];

  const requiredTotal = checks.length;
  const requiredComplete = checks.filter(c => c.ok).length;
  const requiredPercent = Math.round((requiredComplete / requiredTotal) * 80); // 80% allocated to required

  const bonusTotal = bonus.length;
  const bonusComplete = bonus.filter(b => b.ok).length;
  const bonusPercent = bonusTotal ? Math.round((bonusComplete / bonusTotal) * 20) : 0; // 20% allocated to bonus

  const percent = Math.min(100, requiredPercent + bonusPercent);
  const missing = [
    ...checks.filter(c => !c.ok).map(c => c.label),
  ];

  return { percent, missing };
}

export function computeEmployerCompletion(user) {
  if (!user) return { percent: 0, missing: ['account'] };
  const missing = [];
  let percent = 0;

  // Base contact info (30%)
  const base = [
    { label: 'Name', ok: !!user.name },
    { label: 'Email', ok: !!user.email },
    { label: 'Phone', ok: !!user.phone },
  ];
  const baseComplete = base.filter(b => b.ok).length;
  percent += Math.round((baseComplete / base.length) * 30);
  missing.push(...base.filter(b => !b.ok).map(b => b.label));

  // Company details - required fields (50%)
  const details = user.companyDetails || {};
  const companyRequired = [
    { label: 'Company name', ok: !!details.companyName },
    { label: 'Industry', ok: !!details.industry },
  ];
  const companyComplete = companyRequired.filter(b => b.ok).length;
  percent += Math.round((companyComplete / companyRequired.length) * 50);
  missing.push(...companyRequired.filter(b => !b.ok).map(b => b.label));

  // Optional employer details (20%)
  const bonus = [
    { label: 'Company size', ok: !!details.companySize },
    { label: 'Company website', ok: !!details.website },
    { label: 'Contact role', ok: !!details.contactPersonRole },
    { label: 'Company address', ok: !!details.companyAddress },
  ];
  const bonusComplete = bonus.filter(b => b.ok).length;
  percent += Math.round((bonusComplete / bonus.length) * 20);

  return { percent: Math.min(100, percent), missing };
}
