import { AttachmentBuilder, EmbedBuilder } from "discord.js"

export interface IEmbeddedMessageInput { embeds: EmbedBuilder[], files: AttachmentBuilder[] }