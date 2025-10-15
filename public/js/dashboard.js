document.addEventListener('DOMContentLoaded', () => {
  const runBtn = document.getElementById('runSeedBtn');
  const moduleSel = document.getElementById('seedModule');
  const resultDiv = document.getElementById('seedResult');

  if (!runBtn) return;

  runBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const moduleVal = moduleSel.value;
    resultDiv.textContent = `Seeding ${moduleVal}...`;

    try {
      const res = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: moduleVal })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Seed failed');
      resultDiv.textContent = `✅ ${data.message} (${data.module})`;
    } catch (err) {
      resultDiv.textContent = `❌ ${err.message}`;
    }
  });

  // Dashboard initialization code can go here if needed in the future
  console.log('Dashboard loaded');
});
