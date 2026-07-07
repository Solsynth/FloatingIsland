<script setup lang="ts">
defineProps<{
  userName?: string
  featureName: string
  description: string
  imageUrl?: string
  ctaUrl: string
  ctaLabel?: string
}>()
</script>

<template>
  <EHtml lang="en" dir="ltr">
    <EHead>
      <EStyle>
        .btn-cta { background-color: #4f46e5; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 16px; }
      </EStyle>
    </EHead>
    <EBody style="margin:0;padding:0;background-color:#f8fafc;font-family:Nunito,Arial,sans-serif;">
      <EContainer style="max-width:600px;margin:0 auto;padding:32px 16px;">
        <ESection style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
          <ESection style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:48px 32px;text-align:center;">
            <EHeading as="p" style="margin:0 0 8px;font-size:14px;color:#e0e7ff;font-weight:600;text-transform:uppercase;letter-spacing:1px;">
              New Feature
            </EHeading>
            <EHeading as="h1" style="margin:0;font-size:28px;color:#ffffff;font-weight:700;">
              {{ featureName }}
            </EHeading>
          </ESection>
          <ESection style="padding:40px 32px;">
            <EText v-if="userName" style="margin:0 0 8px;font-size:16px;color:#64748b;">
              Hi {{ userName }},
            </EText>
            <EText style="margin:0 0 24px;font-size:16px;color:#475569;line-height:1.7;">
              {{ description }}
            </EText>
            <EImg v-if="imageUrl" :src="imageUrl" width="536" alt="Feature preview" style="border-radius:8px;margin-bottom:24px;" />
            <EText style="text-align:center;margin:8px 0 0;">
              <EButton :href="ctaUrl" class="btn-cta">
                {{ ctaLabel ?? 'Try It Now' }}
              </EButton>
            </EText>
          </ESection>
        </ESection>
        <EText style="text-align:center;font-size:12px;color:#94a3b8;margin-top:24px;">
          Solar Network &middot; solian.app &middot;
          <ELink href="https://solian.app/settings/notifications" style="color:#94a3b8;text-decoration:underline;">
            Manage preferences
          </ELink>
        </EText>
      </EContainer>
    </EBody>
  </EHtml>
</template>
