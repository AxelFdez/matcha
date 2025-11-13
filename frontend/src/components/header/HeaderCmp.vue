<template>
  <div class="header bg-zinc-900">
    <TitleCmp />

    <div class="buttons--container">
      <div class="buttons">
        <!-- <LangSelectBtn /> -->

        <ConnectBtn v-if="!$store.getters.getIsConnected" />
        <button
          v-if="$store.getters.getIsConnected"
          @click="redirectToResearchPage"
          class="burger-btn"
        >
          <span class="icon-wrapper">
            <i class="fa fa-search"></i>
          </span>
        </button>
        <button v-if="$store.getters.getIsConnected" @click="toggleSidebar" class="burger-btn">
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </span>
        </button>

        <Sidebar v-if="$store.getters.getIsConnected && open" @close="toggleSidebar" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import TitleCmp from "./TitleCmp.vue";
import LangSelectBtn from "./LangSelectBtn.vue";
import ConnectBtn from "./ConnectBtn.vue";
import Sidebar from "@/components/sidebar.vue";
import { useRouter } from "vue-router";
export default {
  name: "HeaderCmp",
  components: {
    TitleCmp,
    LangSelectBtn,
    ConnectBtn,
    Sidebar,
  },
  setup() {
    const headerOpacity = ref(1);
    const open = ref(false);
    const router = useRouter();
    const toggleSidebar = () => {
      open.value = !open.value;
    };

    const redirectToResearchPage = () => {
      router.push("/ResearchPage");
    };

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      headerOpacity.value = 1 - scrollPosition / 500;
      headerOpacity.value = Math.min(Math.max(headerOpacity.value, 0), 1);
    };

    onMounted(() => {
      window.addEventListener("scroll", handleScroll);
    });

    onUnmounted(() => {
      window.removeEventListener("scroll", handleScroll);
    });

    return {
      headerOpacity,
      open,
      toggleSidebar,
      redirectToResearchPage,
    };
  },
};
</script>

<style lang="scss">
.header {
  position: fixed;

  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  z-index: 1100;

  .buttons--container {
    display: flex;
    align-items: center;

    .buttons {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-right: 10px;
      width: auto;
    }

    @media (max-width: 700px) {
      align-items: center;

      .buttons {
        margin-right: 10px;
        display: flex;
        align-items: center;
      }
    }
  }
}

.icon-wrapper {
  position: relative;
  display: inline-block;
  width: 1em;
  height: 1em;
  font-size: 24px;
}

.icon-wrapper .fa-search {
  position: absolute;
  top: 0;
  left: 0;
  font-size: 1em;
}

.icon-wrapper .fa-user {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.5em;
}

.burger-btn {
  text-decoration: none;
  display: flex;
  justify-content: center;
  margin: 0 5px 0 10px;
  border: none;
  background: transparent;

  span {
    display: grid;
    align-items: center;
    justify-content: center;
    width: 55px;
    height: 45px;
    border-radius: 8px;
    background-image: linear-gradient(to right, #ff24a7, #8890fe);
    cursor: pointer;
    user-select: none;
    opacity: 1;
    transition: all 0.2s;
    color: white;
    margin-top: 1px;

    svg {
      width: 22px;
      height: 22px;
    }

    &:hover {
      background-image: linear-gradient(to right, #ff24a796, #8890fe8e);
      box-shadow: 0 0 8px #0000008c;
    }
  }

  @media (min-width: 200px) and (max-width: 700px) {
    margin: 0 5px;

    span {
      width: 35px;
      height: 35px;
      margin-top: 0;

      svg {
        width: 18px;
        height: 18px;
      }
    }
  }
}
</style>
