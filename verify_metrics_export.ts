
import { storage } from "./server/storage";

async function verifyExport() {
    console.log("Verifying exportCausativeAreaMetrics...");
    try {
        const month = new Date().getMonth();
        const year = new Date().getFullYear();
        const buffer = await storage.exportCausativeAreaMetrics(month, year);

        if (Buffer.isBuffer(buffer)) {
            console.log("SUCCESS: exportCausativeAreaMetrics returned a Buffer.");
            console.log("Buffer size:", buffer.length, "bytes");
        } else {
            console.error("FAIL: exportCausativeAreaMetrics did not return a Buffer.");
        }
    } catch (error) {
        console.error("Error during verification:", error);
    }
    process.exit(0);
}

verifyExport();
