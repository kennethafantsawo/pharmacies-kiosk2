'use server';

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

export async function updatePharmaciesFile(jsonData: string) {
  // IMPORTANT: This works in local development but will FAIL on Vercel's read-only filesystem.
  // This is implemented to demonstrate functionality locally as per user request.
  
  const pharmaciesPath = path.join(process.cwd(), 'src', 'data', 'pharmacies.json');
  const backupPath = path.join(process.cwd(), 'src', 'data', 'backup.json');

  try {
    // Validate that the string is valid JSON
    JSON.parse(jsonData);

    // Write to both the main and backup files
    await fs.writeFile(pharmaciesPath, jsonData, 'utf8');
    await fs.writeFile(backupPath, jsonData, 'utf8');

    // Invalidate the cache for the main page to reflect changes
    revalidatePath('/');

    return { success: true, message: 'Fichiers mis à jour avec succès sur le serveur local.' };
  } catch (error: any) {
    console.error("File update error:", error);
    if (error.code === 'EPERM' || error.code === 'EROFS') {
        return { success: false, message: "Erreur : Le système de fichiers est en lecture seule. Cette opération n'est pas possible sur Vercel." };
    }
    if (error instanceof SyntaxError) {
        return { success: false, message: 'Erreur : Le texte généré n’est pas un JSON valide.' };
    }
    return { success: false, message: `Échec de la mise à jour des fichiers : ${error.message}` };
  }
}
