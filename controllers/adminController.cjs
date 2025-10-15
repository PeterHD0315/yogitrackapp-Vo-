const path = require('path');
const { spawn } = require('child_process');

// POST /api/admin/seed { module: 'all' | 'instructor' | 'package' | 'customer' | 'class' | 'attendance' }
exports.seed = async (req, res) => {
  try {
    // Safety: block in production unless token matches
    if (process.env.NODE_ENV === 'production') {
      const headerToken = req.headers['x-demo-seed-token'];
      if (!process.env.DEMO_SEED_TOKEN || headerToken !== process.env.DEMO_SEED_TOKEN) {
        return res.status(403).json({ message: 'Seeding disabled in production.' });
      }
    }

    const allowed = ['all','instructor','package','customer','class','attendance'];
    const moduleArg = (req.body && req.body.module) || 'all';
    if (!allowed.includes(moduleArg)) {
      return res.status(400).json({ message: 'Invalid module', allowed });
    }

    const scriptPath = path.join(__dirname, '..', 'scripts', 'seed.cjs');
    const args = [scriptPath, `--module=${moduleArg}`];
    const child = spawn(process.execPath, args, { cwd: path.join(__dirname, '..') });

    let output = '';
    let errorOutput = '';
    child.stdout.on('data', (d) => { output += d.toString(); });
    child.stderr.on('data', (d) => { errorOutput += d.toString(); });

    child.on('close', (code) => {
      if (code === 0) {
        return res.json({ message: 'Seed completed', module: moduleArg, output });
      } else {
        return res.status(500).json({ message: 'Seed failed', module: moduleArg, code, output, errorOutput });
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Unexpected error', error: err.message });
  }
};
