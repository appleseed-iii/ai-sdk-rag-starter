'use server';

import {
  NewResourceParams,
  insertResourceSchema,
  resources,
} from '@/lib/db/schema/resources';
import { db } from '../db';
import { generateEmbeddings } from '../ai/embedding';
import { embeddings as embeddingsTable } from '../db/schema/embeddings';
import { eq, inArray } from 'drizzle-orm';

export const createResource = async (input: NewResourceParams) => {
  try {
    const { content } = insertResourceSchema.parse(input);

    const [resource] = await db
      .insert(resources)
      .values({ content })
      .returning();

    const embeddings = await generateEmbeddings(content);
    await db.insert(embeddingsTable).values(
      embeddings.map(embedding => ({
        resourceId: resource.id,
        ...embedding,
      })),
    );

    return 'Resource successfully created and embedded.';
  } catch (error) {
    return error instanceof Error && error.message.length > 0
      ? error.message
      : 'Error, please try again.';
  }
};

export const removeResource = async (input: NewResourceParams) => {
  console.timeLog("remove resource")
  try {
    const { content } = insertResourceSchema.parse(input);

    const [resource] = await db
      .delete(resources)
      .where(eq(resources.content, content))
      .returning();
      
      console.log("after resource", resource)
    const embeddings = await generateEmbeddings(content);
    await db.delete(embeddingsTable).where(
      inArray(embeddingsTable.content, embeddings.map(e => e.content))
    );

    console.log("after embedding", embeddings)

    return 'Resource successfully deleted and embeddings deleted.';
  } catch (error) {
    return error instanceof Error && error.message.length > 0
      ? error.message
      : 'Error, please try again.';
  }
};