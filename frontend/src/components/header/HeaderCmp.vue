

<template>
  <div class="header bg-zinc-900">
    <TitleCmp />

    <div class="buttons--container">
      <div class="buttons">
        <!-- Bouton connexion -->
        <ConnectBtn v-if="!isConnected" />

        <!-- Bouton notifications -->
        <button v-if="isConnected" class="icon-btn" @click="toggleSidebar('notifications')">
          <i class="fa fa-bell"></i>
          <span v-if="notificationCount > 0" class="badge">
            {{ notificationCount > 99 ? "99+" : notificationCount }}
          </span>
        </button>

        <!-- Bouton chat -->
        <button v-if="isConnected" class="icon-btn" @click="toggleSidebar('chat')">
          <i class="fa fa-comment"></i>
          <span v-if="unreadMessagesCount > 0" class="badge">
            {{ unreadMessagesCount > 99 ? "99+" : unreadMessagesCount }}
          </span>
        </button>

        <!-- Bouton recherche -->
        <button v-if="isConnected" @click="redirectToResearchPage" class="burger-btn">
          <span class="icon-wrapper">
            <i class="fa fa-search"></i>
          </span>
        </button>

        <!-- Bouton menu burger -->
        <button v-if="isConnected" @click="toggleSidebar(sidebarType || 'menu')" class="burger-btn">
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </span>
        </button>

        <!-- Sidebar -->
        <Sidebar v-if="isConnected && open" :type="sidebarType" @close="closeSidebar" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import TitleCmp from "./TitleCmp.vue";
import ConnectBtn from "./ConnectBtn.vue";
import Sidebar from "@/components/sidebar.vue";
import { fetchData } from "@/config/api.js";

import { watch } from "vue";



export default {
  name: "HeaderCmp",
  components: { TitleCmp, ConnectBtn, Sidebar },
  setup() {
    const store = useStore();
    const router = useRouter();

    const open = ref(false);
    const sidebarType = ref("notifications");

    const isConnected = computed(() => store.getters.getIsConnected);

    const toggleSidebar = (type = "notifications") => {
      open.value = !open.value;
      sidebarType.value = type;
    };

    const closeSidebar = () => (open.value = false);

    const redirectToResearchPage = () => router.push("/ResearchPage");

    const notificationCount = computed(
      () => store.state.notifications?.notifications?.filter((n) => !n.viewed).length || 0
    );
    const unreadMessagesCount = computed(
      () =>
        store.state.notifications?.conversations?.reduce(
          (total, c) => total + (c.unreadCount || 0),
          0
        ) || 0
    );

    /** WebSocket */
    const ws = store.getters.getWebSocket;

    const handleIncomingNotification = (data) => {
      const notif = data.notification || data;
      const newNotif = {
        id: notif.id || Date.now().toString(),
        type: notif.type || "default",
        title: notif.title,
        body: notif.body || notif.message,
        fromUser: notif.username || null,
        createdAt: notif.createdAt || new Date().toISOString(),
        viewed: false,
      };

      // Filtrage doublons
      if (!store.state.notifications.notifications.some((n) => n.id === newNotif.id)) {
        store.commit("notifications/addNotification", newNotif);
      }
    };

    const handleIncomingMessage = (data) => {
      const msg = {
        conversationId: data.conversationId,
        sender: data.message.sender,
        senderUser: data.message.senderUser,
        message: data.message.message,
        date: new Date(data.message.date),
      };
      store.dispatch("notifications/addIncomingMessage", msg);
    };

    /** Fetch initial notifications & conversations */
    const fetchInitialData = async () => {
      try {
        const resNotif = await fetchData("/notifications", { method: "GET" });
        if (Array.isArray(resNotif.data)) {
          store.commit(
            "notifications/setNotifications",
            resNotif.data.map((n) => ({
              ...n,
              id: n.id || Date.now().toString(),
              viewed: n.viewed || false,
            }))
          );
        }

        const resConv = await fetchData("/conversations", { method: "GET" });
        if (resConv.response.ok && resConv.data?.conversations) {
          store.commit("notifications/setConversations", resConv.data.conversations);
        }
      } catch (err) {
        console.error("Erreur fetch initial header:", err);
      }
    };

onMounted(async () => {
  if (isConnected.value) {
    await fetchInitialData();
  }

  // WATCH pour activer le WS même s'il arrive plus tard
  watch(
    () => store.getters.getWebSocket,
    (newWs) => {
      if (!newWs) return;

      // Écoute des messages WebSocket sans écraser les autres listeners
      newWs.addEventListener("message", (event) => {
        try {
          const data = JSON.parse(event.data);

          // Notifications
          if (["notification", "like", "match", "unlike", "profile_view"].includes(data.type)) {
            handleIncomingNotification(data);
          }

          // // Messages de chat
          // if (data.type === "chat" && data.message) {
          //   handleIncomingMessage(data);
          // }
        } catch (err) {
          console.error("Erreur WS header:", err);
        }
      });
    },
    { immediate: true }
  );
});

    onUnmounted(() => {
      if (ws) ws.onmessage = null;
    });



    return {
      open,
      sidebarType,
      toggleSidebar,
      closeSidebar,
      redirectToResearchPage,
      isConnected,
      notificationCount,
      unreadMessagesCount,
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
  }
}

.icon-wrapper {
  position: relative;
  display: inline-block;
  width: 1em;
  height: 1em;
  font-size: 24px;
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
}

.icon-btn {
  position: relative;
  margin: 0 5px;
  border: none;
  background: transparent;
  color: white;
  font-size: 22px;
  cursor: pointer;

  .badge {
    position: absolute;
    bottom: 2px;
    right: -5px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 50%;
    background-color: red;
    color: white;
    font-size: 10px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  &:hover {
    opacity: 0.8;
  }
}
</style>
