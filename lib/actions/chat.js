"use server";

import {prisma} from "@/database/prisma/prisma.js";
import { redirect } from "next/navigation";

export const getUserChats = async (userId) => {
    const chats = await prisma.chat.findMany({
        where: {
            userId: userId
        },
        orderBy: {
            updatedAt: "desc"
        }
    })

    return chats
}

export const getChatMessages = async (chatId) => {
    try {
        const chat = await prisma.chat.findUnique({
            where: {
                id: chatId
            },
            include: {
                messages: {
                    orderBy: {
                        id: "asc"
                    }
                }
            }
        })
    
        return chat.messages

    } catch (err){
        console.error(err)
        return []
    }
}


export const getOrCreateChat = async (chatId, userId) => {
  if (chatId) {
    const existing = await prisma.chat.findUnique({
      where: { id: chatId, userId }
    });
    if (existing) return existing.id;
  }

  try {
          const validateChat = await prisma.chat.findFirst({
              where: {
                  id: chatId,
                  userId: user.id
              }
          })
  
          if (!validateChat) {
              return NextResponse.json(
                      { error: "Unauthorized" },
                      { status: 403 }
                  );
          }
          
      } catch(err){
          console.error(err)
          return NextResponse.json({error: "Internal Error"}, {status: 500})
      }

  const newChat = await prisma.chat.create({
    data: { userId }
  });

  redirect(`/chat/${newChat.id}`);
}

export async function getChat(chatId, userId) {
    try {
        const chat = await prisma.chat.findFirst({
            where: {
                id: chatId,
                userId,
            },
            include: {
                messages: {
                    orderBy: {
                        id: "asc",
                    },
                },
            },
        });

        if(!chat) {
            return {error: `Unable to load conversation ${chatId}`}
        }

        return { messages: chat.messages || []}
    } catch(err) {
        console.error(err)
        return { error: "Internal server error" };
    }
}