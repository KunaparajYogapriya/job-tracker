/**
 * Proof artifacts — storage and validation
 */

const PROOF_ARTIFACTS_KEY = 'jobTrackerProofArtifacts';

function isValidUrl(str) {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  if (!trimmed) return false;
  return /^https?:\/\/.+/.test(trimmed);
}

function getProofArtifacts() {
  try {
    const raw = localStorage.getItem(PROOF_ARTIFACTS_KEY);
    if (!raw) return { lovableLink: '', githubLink: '', deployedUrl: '' };
    const o = JSON.parse(raw);
    return {
      lovableLink: o.lovableLink || '',
      githubLink: o.githubLink || '',
      deployedUrl: o.deployedUrl || ''
    };
  } catch {
    return { lovableLink: '', githubLink: '', deployedUrl: '' };
  }
}

function setProofArtifacts(artifacts) {
  try {
    localStorage.setItem(PROOF_ARTIFACTS_KEY, JSON.stringify(artifacts));
    return true;
  } catch {
    return false;
  }
}

function allProofLinksProvided() {
  const a = getProofArtifacts();
  return isValidUrl(a.lovableLink) && isValidUrl(a.githubLink) && isValidUrl(a.deployedUrl);
}
