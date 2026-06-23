
import { storage } from '../server/storage';

async function testAutoApprove() {
    console.log('Testing Auto-Approval Logic...');

    // 1. Manually set the setting to true
    await storage.setSystemSetting('reposition_auto_approve', 'true', 1);
    console.log('Setting reposition_auto_approve set to "true"');

    // 2. Read it back
    const val = await storage.getSystemSetting('reposition_auto_approve');
    console.log(`Value from storage: "${val}" (Type: ${typeof val})`);

    if (val === 'true') {
        console.log('Condition (val === "true") is TRUE');
    } else {
        console.log('Condition (val === "true") is FALSE');
        console.log(`Expected "true" but got "${val}"`);
        // check for whitespace
        if (val?.trim() === 'true') {
            console.log('NOTE: Value has whitespace!');
        }
    }

    process.exit(0);
}

testAutoApprove().catch(console.error);
