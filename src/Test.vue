<template>
  <div>
    <PasteButton />
  </div>
  <h1 class="bg-blue-500 text-3xl font-bold underline">test</h1>

  <Button>Button</Button>
  <Button
    variant="outline"
    @click="
      () => {
        // toast('Event has been created', {
        //   description: 'Sunday, December 03, 2023 at 9:00 AM',
        //   action: {
        //     label: 'Undo',
        //     onClick: () => console.log('Undo'),
        //   },
        // });
      }
    "
  >
    Add to calendar
  </Button>

  <!-- <AlertDialog v-model="isShowDialog" /> -->
  <!-- <Select /> -->
  <div style="width: 400px; padding: 20px">
    <MySlider />
  </div>

  <!-- <Toaster class="pointer-events-auto" /> -->
</template>

<script setup lang="ts">
import PasteButton from "@/components/icons/PasteButton.vue";
import { Button } from "@/components/ui/button";
// import { AlertDialog } from "@/components/ui/alert-dialog";
// import { Toaster } from "@/components/ui/sonner";
import { Slider } from "@/components/ui/slider";
// import { toast } from "vue-sonner";
import { ref } from "vue";
import MySlider from "@/components/ui/MySlider.vue";

var isShowDialog = ref(false);
</script>

<style scoped>
:deep(svg) {
  padding: 10px;
}
</style>
