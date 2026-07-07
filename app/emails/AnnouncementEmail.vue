<script setup lang="ts">
defineProps<{
  title: string
  body: string
  actionUrl?: string
  actionLabel?: string
}>()
</script>

<template>
  <EHtml lang="en" dir="ltr">
    <EHead>
      <EStyle>
        .btn-cta { background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; }
      </EStyle>
    </EHead>
    <EBody style="margin:0;padding:0;background-color:#f8fafc;font-family:Nunito,Arial,sans-serif;">
      <EContainer style="max-width:600px;margin:0 auto;padding:32px 16px;">
        <ESection style="background:#4f46e5;border-radius:16px 16px 0 0;padding:32px;text-align:center;">
          <EHeading as="h1" style="margin:0;font-size:18px;color:#ffffff;font-weight:600;">
            Solar Network
          </EHeading>
        </ESection>
        <ESection style="background:#ffffff;border-radius:0 0 16px 16px;padding:40px 32px;border:1px solid #e2e8f0;border-top:none;">
          <EHeading as="h2" style="margin:0 0 16px;font-size:22px;color:#1e293b;">
            {{ title }}
          </EHeading>
          <EText style="margin:0 0 24px;font-size:16px;color:#475569;line-height:1.7;">
            {{ body }}
          </EText>
          <EText v-if="actionUrl" style="text-align:center;margin:32px 0 0;">
            <EButton :href="actionUrl" class="btn-cta">
              {{ actionLabel ?? 'Learn More' }}
            </EButton>
          </EText>
        </ESection>
        <EText style="text-align:center;font-size:12px;color:#94a3b8;margin-top:24px;line-height:1.5;">
          You're receiving this because you're a member of Solar Network.<br>
          Solar Network &middot; solian.app
        </EText>
      </EContainer>
    </EBody>
  </EHtml>
</template>
