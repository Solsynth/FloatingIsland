<script setup lang="ts">
defineProps<{
  userName: string
  month: string
  year: number
  topPosts: { title: string; author: string; url: string }[]
  newFollowers: number
  totalLikes: number
  totalComments: number
  profileUrl: string
}>()
</script>

<template>
  <EHtml lang="en" dir="ltr">
    <EHead>
      <EStyle>
        .stat-box { background: #f1f5f9; border-radius: 12px; padding: 16px; text-align: center; width: 30%; }
        .stat-number { font-size: 24px; font-weight: 700; color: #4f46e5; margin: 0; }
        .stat-label { font-size: 12px; color: #64748b; margin: 4px 0 0; }
        .post-item { padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
        .btn-cta { background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; }
      </EStyle>
    </EHead>
    <EBody style="margin:0;padding:0;background-color:#f8fafc;font-family:Nunito,Arial,sans-serif;">
      <EContainer style="max-width:600px;margin:0 auto;padding:32px 16px;">
        <ESection style="background:#ffffff;border-radius:16px;padding:40px 32px;border:1px solid #e2e8f0;">
          <EHeading as="h1" style="margin:0 0 4px;font-size:24px;color:#1e293b;">
            Your {{ month }} {{ year }} Digest
          </EHeading>
          <EText style="margin:0 0 24px;font-size:16px;color:#64748b;">
            Hi {{ userName }}, here's what happened on Solar Network this month.
          </EText>

          <!-- Stats Row -->
          <EText style="margin:0 0 24px;">
            <ERow>
              <EColumn style="display:inline-block;width:30%;padding:0 4px;vertical-align:top;">
                <ESection style="background:#f1f5f9;border-radius:12px;padding:16px;text-align:center;">
                  <EHeading as="p" class="stat-number">{{ totalLikes }}</EHeading>
                  <EText class="stat-label">Likes</EText>
                </ESection>
              </EColumn>
              <EColumn style="display:inline-block;width:30%;padding:0 4px;vertical-align:top;">
                <ESection style="background:#f1f5f9;border-radius:12px;padding:16px;text-align:center;">
                  <EHeading as="p" class="stat-number">{{ totalComments }}</EHeading>
                  <EText class="stat-label">Comments</EText>
                </ESection>
              </EColumn>
              <EColumn style="display:inline-block;width:30%;padding:0 4px;vertical-align:top;">
                <ESection style="background:#f1f5f9;border-radius:12px;padding:16px;text-align:center;">
                  <EHeading as="p" class="stat-number">{{ newFollowers }}</EHeading>
                  <EText class="stat-label">New Followers</EText>
                </ESection>
              </EColumn>
            </ERow>
          </EText>

          <!-- Top Posts -->
          <EHeading as="h2" style="margin:24px 0 12px;font-size:18px;color:#1e293b;">
            Trending Posts
          </EHeading>
          <template v-for="(post, i) in topPosts" :key="i">
            <ESection class="post-item">
              <ELink :href="post.url" style="color:#4f46e5;font-weight:600;text-decoration:none;font-size:15px;">
                {{ post.title }}
              </ELink>
              <EText style="margin:4px 0 0;font-size:13px;color:#94a3b8;">
                by {{ post.author }}
              </EText>
            </ESection>
          </template>

          <EText style="text-align:center;margin:32px 0 0;">
            <EButton :href="profileUrl" class="btn-cta">
              View Your Profile
            </EButton>
          </EText>
        </ESection>
        <EText style="text-align:center;font-size:12px;color:#94a3b8;margin-top:24px;">
          Solar Network &middot; solian.app &middot;
          <ELink href="https://solian.app/settings/notifications" style="color:#94a3b8;text-decoration:underline;">
            Unsubscribe
          </ELink>
        </EText>
      </EContainer>
    </EBody>
  </EHtml>
</template>
