<script setup lang="ts">
import {
    LineSquiggle as IconLine,
    GlobeCheck as GlobeCheckIcon,
    Code2 as IconCode,
} from "@lucide/vue";

const features = [
    {
        icon: IconLine,
        title: "UI 大换新",
        description:
            "从头到尾，每一个按钮，每一个输入框都得到了重新设计和修改。以及添加了大量动画爆破你的低端设备。",
        image: "https://solsynth.dev/images/solar-network/screenshots/explore.webp",
    },
    {
        icon: GlobeCheckIcon,
        title: "在线状态同步",
        description:
            "不管是听音乐（依赖客户端），还是在 Steam 上玩游戏（依赖 Steam 帐号链接），都能同步到 Solar Network 上，分享给你的好友们！",
        image: "https://solsynth.dev/images/solar-network/screenshots/profile-presences.webp",
    },
    {
        icon: IconCode,
        title: "更强大的开放平台",
        description:
            "从 OAuth，自定义应用，机器人帐号，商品等等。功能一应俱全，助力你利用 Solar Network API 构建你自己的应用。",
        image: "https://solsynth.dev/images/solar-network/screenshots/developer-hub.webp",
    },
] satisfies { title: string; description: string; icon: any; image?: string }[];

defineProps<{
    ctaUrl?: string;
    ctaLabel?: string;
}>();
</script>

<template>
    <EHtml lang="zh-CN" dir="ltr">
        <EHead>
            <EStyle>
                .btn-cta {
                    background-color: #7577ba;
                    color: #ffffff;
                    padding: 16px 40px;
                    border-radius: 10px;
                    text-decoration: none;
                    font-weight: 700;
                    display: inline-block;
                    font-size: 16px;
                    letter-spacing: 0.3px;
                    border: none;
                    cursor: pointer;
                    text-align: center;
                }
                .btn-cta:hover {
                    background-color: #6265a8;
                }
                .link {
                    color: #374151;
                    text-decoration: underline;
                    text-decoration-style: dotted;
                    text-underline-offset: 3px;
                }
                .feature-card { background: #f8fafc; border-radius: 12px;
                padding: 20px; margin-bottom: 16px; border: 1px solid #e2e8f0;
                overflow: visible; }
            </EStyle>
        </EHead>
        <EBody
            style="
                margin: 0;
                padding: 0;
                background-color: #f8fafc;
                font-family:
                    Nunito, &quot;Noto Sans SC&quot;, Arial, sans-serif;
            "
        >
            <EContainer
                style="max-width: 600px; margin: 0 auto; padding: 32px 16px"
            >
                <!-- Hero -->
                <ESection
                    style="
                        background: #ffffff;
                        border-radius: 16px 16px 0 0;
                        padding: 32px;
                        text-align: left;
                        border: 1px solid #e2e8f0;
                        border-bottom: 1px solid #f1f5f9;
                    "
                >
                    <EImg
                        src="https://solian.app/favicon.png"
                        style="height: 64px; width: 64px; margin: 0 0 12px 0"
                    />
                    <EHeading
                        as="p"
                        style="
                            margin: 0;
                            font-size: 20px;
                            color: #9091c7;
                            font-weight: 800;
                        "
                    >
                        Solar Network
                    </EHeading>
                    <EHeading
                        as="h1"
                        style="
                            margin: 0;
                            font-size: 28px;
                            color: #1e293b;
                            font-weight: 800;
                        "
                    >
                        好久不见，我们还活着哦。
                    </EHeading>
                </ESection>

                <!-- Main Content -->
                <ESection
                    style="
                        background: #ffffff;
                        padding: 32px;
                        border-left: 1px solid #e2e8f0;
                        border-right: 1px solid #e2e8f0;
                    "
                >
                    <EText
                        style="
                            margin: 0 0 24px;
                            font-size: 16px;
                            color: #475569;
                            line-height: 1.7;
                        "
                    >
                        嗨 👋 <br />
                        好久不见，羊终于闲下来了可以完成几个月前就设想的产品更新月报计划。
                        向各位回报一些 Solar Network 近期的新功能和调整什么的。
                        <br />
                        这是这个计划的第一封邮件，但绝对不会是最后一封。 <br />
                    </EText>

                    <EText
                        style="
                            margin: 8px 0 28px;
                            font-size: 16px;
                            color: #475569;
                            line-height: 1.7;
                        "
                    >
                        至于为什么第一封邮件起这个标题，一方面是对之前看到过关于”跑路“相关的回应。
                        另一方面是这是 SN 第一次发营销邮件，希望能寻回一些老 SN
                        用户捏～
                    </EText>

                    <!-- Feature List -->
                    <template v-for="(feature, i) in features" :key="i">
                        <ESection class="feature-card" style="padding: 0">
                            <ESection style="padding: 20px 20px 0 20px">
                                <EHeading
                                    as="h2"
                                    style="
                                        margin: 0 0 8px;
                                        font-size: 17px;
                                        color: #1e293b;
                                        font-weight: 700;
                                        display: flex;
                                        align-items: center;
                                        gap: 8px;
                                    "
                                >
                                    <component
                                        :is="feature.icon"
                                        style="
                                            width: 18px;
                                            height: 18px;
                                            margin-bottom: 3px;
                                            stroke: #7577ba;
                                            flex-shrink: 0;
                                        "
                                    />
                                    <EText style="margin: 0">{{
                                        feature.title
                                    }}</EText>
                                </EHeading>
                                <EText
                                    style="
                                        margin: 0 0 16px;
                                        font-size: 14px;
                                        color: #64748b;
                                        line-height: 1.6;
                                    "
                                >
                                    {{ feature.description }}
                                </EText>
                            </ESection>
                            <EImg
                                v-if="feature.image"
                                :src="feature.image"
                                width="100%"
                                style="
                                    display: block;
                                    border-radius: 0 0 12px 12px;
                                "
                            />
                        </ESection>
                    </template>

                    <EText
                        style="
                            margin: 24px 0 24px;
                            font-size: 16px;
                            color: #475569;
                            line-height: 1.7;
                        "
                    >
                        这是十几个月发生的事情太多太多了，一封邮件绝对不够，所以羊精选了几个他最喜欢的功能放到了邮件里面。
                        <br />
                        至于剩下的嘛……就交给你更新完 Solian
                        之后登录上来自己探索吧！
                    </EText>

                    <EText style="text-align: center; margin: 0;">
                        <EButton
                            href="https://solsynth.dev/zh/products/solar-network"
                            class="btn-cta"
                            style="padding: 16px 40px; display: inline-block; text-align: center;"
                        >
                            了解更多
                        </EButton>
                    </EText>

                    <EText
                        style="
                            margin: 24px 0 24px;
                            font-size: 16px;
                            color: #475569;
                            line-height: 1.7;
                        "
                    >
                        对了对了！Develop with Solar Network 2026
                        特别活动现也正在火热进行中哦！
                        <span style="text-decoration: line-through">
                            还有丰富的奖品！
                        </span>
                        <ELink
                            href="https://solsynth.dev/zh/contests/develop-with-sn-2026"
                            class="link"
                            style="color: #374151; text-decoration: underline; text-decoration-style: dotted;"
                        >
                            访问特别活动页面
                        </ELink>
                    </EText>

                    <EText
                        style="
                            margin: 0 0 24px;
                            color: #475569;
                            font-size: 0.75rem;
                            font-style: italic;
                        "
                    >
                        也可能你是活跃用户，但是因为羊是向全体注册用户发送的邮件；Anyway
                        you know the meaning.
                    </EText>
                </ESection>

                <!-- Closing -->
                <ESection
                    style="
                        background: #ffffff;
                        border-radius: 0 0 16px 16px;
                        padding: 24px 32px;
                        border: 1px solid #e2e8f0;
                        border-top: 1px solid #f1f5f9;
                    "
                >
                    <EText
                        style="
                            margin: 0;
                            font-size: 14px;
                            color: #64748b;
                            line-height: 1.7;
                        "
                    >
                        Solar Network 可能会倒闭，但永远不会变质！
                    </EText>
                    <EText
                        style="
                            margin: 0;
                            text-align: right;
                            font-size: 14px;
                            color: #64748b;
                            line-height: 1.7;
                        "
                    >
                        —— LittleSheep 2026
                    </EText>
                </ESection>

                <!-- Footer -->
                <EText
                    style="
                        text-align: center;
                        font-size: 12px;
                        color: #94a3b8;
                        margin-top: 24px;
                        line-height: 1.6;
                    "
                >
                    你收到这份邮件因为您是 Solar Network 社区重要的一部份<br />
                    Solsynth © 2026
                </EText>
                <EHr />
                <EText
                    style="
                        text-align: center;
                        font-size: 12px;
                        color: #94a3b8;
                        margin-top: 24px;
                        line-height: 1.6;
                    "
                >
                    如果您不希望继续收到类似的邮件 或者真的决定要离开 <br />
                    在 Solian 帐号设置页面有注销帐号选项可用<br />
                    (T . T)
                </EText>
            </EContainer>
        </EBody>
    </EHtml>
</template>
