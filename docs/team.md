---
layout: page
title: Meet the Team
description: The people behind pantry
sidebar: false
---

<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamPageSection,
  VPTeamMembers
} from 'vitepress/theme'
import { core, contributors } from './_data/team'
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>Meet the Team</template>
    <template #lead>
      pantry is developed and maintained by a dedicated team passionate about creating better developer tools.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers :members="core" />
  <VPTeamPageSection>
    <template #title>Contributors</template>
    <template #lead>
      Thank you to all the amazing people who have contributed to pantry.
    </template>
    <template #members>
      <VPTeamMembers size="small" :members="contributors" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
