import { PrismaClient } from '@prisma/client';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const prisma = new PrismaClient();

async function cleanupOrphanedAttachments() {
  try {
    console.log('Finding orphaned attachments...');
    
    // Find all attachments that are not connected to any topic or comment
    const orphanedAttachments = await prisma.attachment.findMany({
      where: {
        AND: [
          { topicId: null },
          { commentId: null },
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
      const filepath = join(process.cwd(), 'public', 'uploads', attachment.filename);
      if (existsSync(filepath)) {
        try {
          await unlink(filepath);
          console.log(`Deleted file: ${attachment.filename}`);
        } catch (error) {
          console.error(`Failed to delete file ${attachment.filename}:`, error);
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
