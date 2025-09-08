import { Injectable, Logger } from "@nestjs/common";
import { DiscordWebhookError } from "./exceptions/webhookerror.exception";
import { ConfigService } from "src/config/config.service";

@Injectable()
export class NotificationService {
  private logger = new Logger(NotificationService.name);

  constructor(private configService: ConfigService) {}

  private async send(title: string, description: string) {
    const embed = { title, description, color: 0x70e000 };
    const discordWebhookUrl = this.configService.get(
      `notifications.discordWebhookUrl`,
    );

    if (!discordWebhookUrl) {
      this.logger.warn("Discord webhook url not found in config");
      return;
    }

    const response = await fetch(discordWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!response.ok) {
      throw new DiscordWebhookError(
        "Failed to execute discord webhook",
        response.status,
      );
    }
  }

  async sendFileUploadNotification(file: { id?: string; name: string }) {
    try {
      await this.send("New file uploaded", "");
    } catch (error) {
      let message = "Error executing discord webhook";
      if (error instanceof DiscordWebhookError) {
        message = `${error.message} - status code ${error.statusCode}`;
      }

      this.logger.error(message);
    }
  }
}
