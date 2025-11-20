<template>
  <div class="header bg-zinc-900">
    <TitleCmp />

    <div class="buttons--container">
      <div class="buttons">
        <!-- Bouton connexion -->
        <ConnectBtn v-if="!isConnected" />

        <!-- Bouton notifications -->
        <button v-if="isConnected" class="icon-btn" @click="toggleSidebar">
          <i class="fa fa-bell"></i>
          <span v-if="notificationCount > 0" class="badge">
            {{ notificationCount > 99 ? "99+" : notificationCount }}
          </span>
        </button>

        <!-- Bouton chat -->
        <button v-if="isConnected" class="icon-btn" @click="toggleSidebar">
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

        <!-- Bouton sidebar -->
        <button v-if="isConnected" @click="toggleSidebar" class="burger-btn">
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </span>
        </button>

        <!-- Sidebar -->
        <Sidebar v-if="isConnected && open" @close="toggleSidebar" />
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
import { fetchData } from "@/config/api.js"; // <- ajout fetch initial

export default {
  name: "HeaderCmp",
  components: { TitleCmp, ConnectBtn, Sidebar },
  setup() {
    const store = useStore();
    const router = useRouter();
    const open = ref(false);

    const isConnected = computed(() => store.getters.getIsConnected);

    const toggleSidebar = () => {
      open.value = !open.value;
    };

    const redirectToResearchPage = () => {
      router.push("/ResearchPage");
    };

    // Badges instantanés basés sur store
    const notificationCount = computed(
      () => store.state.notifications.notifications.filter((n) => !n.viewed).length
    );
    const unreadMessagesCount = computed(() =>
      store.state.notifications.conversations.reduce((total, c) => total + (c.unreadCount || 0), 0)
    );

    /** WebSocket */
    const ws = store.getters.getWebSocket;

    const handleIncomingNotification = (data) => {
      const notif = data.notification || data;
      store.commit("notifications/addNotification", {
        id: notif.id || Date.now(),
        type: notif.type || "default",
        title: notif.title,
        message: notif.message,
        username: notif.username || null,
        createdAt: notif.createdAt || new Date().toISOString(),
        viewed: false,
      });
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

    /** Fetch initial unique au chargement pour pré-remplir le store */
    const fetchInitialData = async () => {
      try {
        // Notifications
        const resNotif = await fetchData("/notifications", { method: "GET" });
        if (Array.isArray(resNotif.data)) {
          // Remplace complètement le store, pas de push/add
          store.commit("notifications/setNotifications", resNotif.data);
        }

        // Conversations
        const resConv = await fetchData("/conversations", { method: "GET" });
        if (resConv.response.ok && resConv.data?.conversations) {
          store.commit("notifications/setConversations", resConv.data.conversations);
        }
      } catch (err) {
        // console.error("Erreur fetch initial header:", err);
      }
    };

    onMounted(async () => {
      // fetch unique pour pré-remplir uniquement si connecté
      if (isConnected.value) {
        await fetchInitialData();
      }

      // WebSocket
      if (ws) {
        const originalOnMessage = ws.onmessage;
        ws.onmessage = (event) => {
          if (originalOnMessage) originalOnMessage.call(ws, event);
          try {
            const data = JSON.parse(event.data);
            if (["notification", "like", "match", "unlike", "profile_view"].includes(data.type))
              handleIncomingNotification(data);
            if (data.type === "chat" && data.message) handleIncomingMessage(data);
          } catch (err) {
            // console.error(err);
          }
        };
      }
    });

    onUnmounted(() => {
      if (ws) ws.onmessage = null;
    });

    return {
      open,
      toggleSidebar,
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
