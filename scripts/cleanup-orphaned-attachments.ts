import 'dotenv/config';
import { unlink } from 'fs/promises';
import { prisma } from '../src/lib/prisma';
import { uploadPath } from '../src/lib/uploads';

// Uploads are orphaned until the topic/comment is submitted, so leave recent ones alone
const MIN_AGE_MS = 24 * 60 * 60 * 1000;

async function cleanupOrphanedAttachments() {
  try {
    console.log('Finding orphaned attachments...');
    
    // Find all attachments that are not connected to any topic or comment
    const orphanedAttachments = await prisma.attachment.findMany({
      where: {
        AND: [
          { topicId: null },
          { commentId: null },
          { createdAt: { lt: new Date(Date.now() - MIN_AGE_MS) } },
        ],
      },
    });

    console.log(`Found ${orphanedAttachments.length} orphaned attachments`);

    if (orphanedAttachments.length === 0) {
      console.log('No orphaned attachments to clean up');
      return;
    }

    // Delete files and database records
    for (const attachment of orphanedAttachments) {
      // Delete file from disk
      const filepath = uploadPath(attachment.filename);
      if (filepath) {
        try {
          await unlink(filepath);
          console.log(`Deleted file: ${attachment.filename}`);
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            console.error(`Failed to delete file ${attachment.filename}:`, error);
          }
        }
      }

      // Delete database record
      await prisma.attachment.delete({
        where: { id: attachment.id },
      });
      console.log(`Deleted attachment record: ${attachment.id}`);
    }

    console.log('Cleanup completed!');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOrphanedAttachments();
