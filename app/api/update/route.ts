import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    let body: any = {};
    try { body = await request.json(); } catch (e) { }

    // Check if an update is actually available by comparing with origin/main
    if (body.action === 'check') {
      try {
        await execAsync('git fetch origin');
        const { stdout: countOut } = await execAsync('git rev-list HEAD...origin/main --count');
        const count = parseInt(countOut.trim()) || 0;

        if (count > 0) {
          const { stdout: logOut } = await execAsync('git log HEAD..origin/main --pretty=format:"%s"');
          const allCommits = logOut.split('\n').map(c => c.trim()).filter(Boolean);

          // Filter for user-facing changes (features, fixes, improvements)
          const keywordRegex = /^(feat|fix|feature|added|fixed|bug|enhancement|update|resolved|improved)/i;
          const importantCommits = allCommits.filter(msg => keywordRegex.test(msg));

          const displayCommits = importantCommits.length > 0
            ? importantCommits
            : ['Internal performance and stability improvements.'];

          return NextResponse.json({
            success: true,
            updateAvailable: true,
            message: `An update is available! (${count} changes behind).\nClick 'Update Now' to proceed.`,
            changelog: displayCommits
          });
        } else {
          return NextResponse.json({ success: true, updateAvailable: false, message: 'Your dashboard is already up to date with latest features and improvements from GitHub.' });
        }
      } catch (err: any) {
        if (err.message && (err.message.includes('not recognized') || err.message.includes('git: command not found'))) {
          return NextResponse.json({ success: false, error: 'Git is not installed or not in system PATH.' });
        }
        return NextResponse.json({ success: false, error: 'Could not fetch updates from GitHub. Check your internet connection.' });
      }
    }

    // Trigger the actual update via the standalone batch script
    if (body.action === 'apply') {
      const scriptPath = path.join(process.cwd(), 'update-build.bat');

      // We launch the script via cmd.exe in a new window, not waiting for it to finish
      // because it will kill this very process to avoid file locking during build!
      exec(`cmd.exe /c start "" "${scriptPath}"`);

      return NextResponse.json({
        success: true,
        message: 'Update initiated!\n\nPlease look for the "Administrator" prompt on your screen and click "Yes". The auto-updater script will take over from here!'
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid update action.' }, { status: 400 });

  } catch (error: any) {
    console.error('Update logic failed:', error);
    return NextResponse.json({ success: false, error: error.message || 'Unknown error occurred.' }, { status: 500 });
  }
}
