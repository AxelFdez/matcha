<template>
  <aside
    id="default-sidebar"
    class="fixed right-0 top-0 z-[1200] h-screen w-full sm:w-80 md:w-96 translate-x-0 transition-transform shadow-2xl"
    aria-label="Sidenav"
  >
    <div class="h-full overflow-y-auto border-r border-gray-900 bg-zinc-900 px-3 py-5">
      <!-- Close Button -->
      <div class="mb-4 flex items-center justify-end">
        <button
          @click="closeSidebar"
          class="rounded-lg p-2 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
          aria-label="Fermer la sidebar"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Main Sidebar Content -->
      <div
        class="mb-4 flex items-center justify-around border-b border-gray-200 pb-4 dark:border-gray-600"
      >
        <ProfileBtn v-if="$store.getters.getIsConnected" @click="closeSidebar" />
        <DisconnectBtn v-if="$store.getters.getIsConnected" @click="closeSidebar" />
      </div>

      <div v-if="!showNotifications && !showChat">
        <ul class="space-y-2">
          <li>
            <button
              @click="openNotifications"
              class="group flex w-full items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            >
              <svg
                class="size-6 text-gray-400 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"
                ></path>
              </svg>
              <span class="ml-3 flex-1 text-left">Notifications</span>
              <span
                v-if="notificationCount > 0"
                class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white animate-pulse"
              >
                {{ notificationCount > 99 ? "99+" : notificationCount }}
              </span>
            </button>
          </li>
          <li>
            <button
              @click="openChat"
              class="group flex w-full items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            >
              <svg
                class="size-6 text-gray-400 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2 5A2 2 0 014 3h12a2 2 0 012 2v8a2 2 0 01-2 2H7l-3 3V5z"></path>
              </svg>
              <span class="ml-3 flex-1 text-left">Chat</span>
              <span
                v-if="unreadMessagesCount > 0"
                class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white animate-pulse"
              >
                {{ unreadMessagesCount > 99 ? "99+" : unreadMessagesCount }}
              </span>
            </button>
          </li>
        </ul>
      </div>

      <!-- Notifications Content -->
      <div v-if="showNotifications">
        <div class="mb-4 flex items-center">
          <button
            @click="backToMain"
            class="mr-3 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <svg
              class="size-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </button>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
        </div>

        <!-- Notifications List -->
        <div class="space-y-2">
          <div
            v-if="notifications.length === 0"
            class="rounded-lg p-4 text-center text-gray-500 dark:text-gray-400"
          >
            Aucune notification
          </div>

          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-600 dark:bg-gray-700 transition-all cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600"
            :class="{
              'border-l-4 border-l-blue-500 animate-slideIn': !notification.viewed,
              'opacity-75': notification.viewed,
            }"
            @click="openProfileFromNotification(notification)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <!-- Icône selon le type -->
                <div class="flex items-center gap-2 mb-1">
                  <span v-if="notification.type === 'like'" class="text-red-500">❤️</span>
                  <span v-else-if="notification.type === 'match'" class="text-pink-500">💕</span>
                  <span v-else-if="notification.type === 'unlike'" class="text-gray-500">💔</span>
                  <span
                    v-else-if="
                      notification.type === 'profile_view' || notification.type === 'viewed'
                    "
                    class="text-blue-500"
                    >👁️</span
                  >
                  <span v-else-if="notification.type === 'message'" class="text-green-500">💬</span>

                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ notification.title }}
                  </p>
                </div>

                <p
                  v-if="notification.message"
                  class="mt-1 text-sm text-gray-600 dark:text-gray-300"
                >
                  {{ notification.message }}
                </p>
                <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  {{ formatDate(notification.createdAt) }}
                </p>
              </div>
              <button
                @click.stop="deleteNotification(notification.id)"
                class="ml-2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300"
              >
                <svg class="size-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Content -->
      <div v-if="showChat && !showChatMessages">
        <div class="mb-4 flex items-center">
          <button
            @click="backToMain"
            class="mr-3 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <svg
              class="size-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </button>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Chat</h2>
        </div>

        <!-- Conversations List -->
        <div class="space-y-2">
          <div
            v-if="chatLoading"
            class="rounded-lg p-4 text-center text-gray-500 dark:text-gray-400"
          >
            Chargement...
          </div>

          <div
            v-else-if="conversations.length === 0"
            class="rounded-lg p-4 text-center text-gray-500 dark:text-gray-400"
          >
            Aucune conversation
          </div>

          <div
            v-for="conversation in conversations"
            :key="conversation.id"
            @click="openChatMessages(conversation)"
            class="cursor-pointer rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
            :class="{ 'border-l-4 border-l-blue-500': conversation.hasUnreadMessages }"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="size-10 flex-shrink-0">
                  <img
                    v-if="getFirstPhoto(conversation.otherUser.avatar)"
                    :src="getFirstPhoto(conversation.otherUser.avatar)"
                    :alt="conversation.otherUser.username"
                    class="size-10 rounded-full object-cover"
                  />
                  <div
                    v-else
                    class="size-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 dark:bg-gray-600 dark:text-gray-300"
                  >
                    {{ conversation.otherUser.username.charAt(0).toUpperCase() }}
                  </div>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ conversation.otherUser.username }}
                  </p>
                  <p
                    v-if="conversation.lastMessage"
                    class="text-sm text-gray-600 dark:text-gray-300 truncate"
                  >
                    {{ conversation.lastMessage.message }}
                  </p>
                  <p v-else class="text-sm text-gray-400 dark:text-gray-500 italic">
                    Commencer une conversation
                  </p>
                </div>
              </div>
              <div class="flex flex-col items-end space-y-1">
                <p v-if="conversation.lastMessage" class="text-xs text-gray-400 dark:text-gray-500">
                  {{ formatDate(conversation.lastMessage.date) }}
                </p>
                <span
                  v-if="conversation.unreadCount > 0"
                  class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white"
                >
                  {{ conversation.unreadCount }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Messages View -->
      <div v-if="showChatMessages && selectedConversation">
        <div class="mb-4 flex items-center">
          <button
            @click="backToConversations"
            class="mr-3 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <svg
              class="size-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </button>
          <div class="flex items-center space-x-2">
            <div class="size-8 flex-shrink-0 relative">
              <img
                v-if="selectedConversation.otherUser.avatar"
                :src="getFirstPhoto(selectedConversation.otherUser.avatar)"
                :alt="selectedConversation.otherUser.username"
                class="size-8 rounded-full object-cover"
              />
              <div
                v-else
                class="size-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 dark:bg-gray-600 dark:text-gray-300 text-xs"
              >
                {{ selectedConversation.otherUser.username.charAt(0).toUpperCase() }}
              </div>
              <!-- Indicateur de statut -->
              <div
                class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800"
                :class="selectedConversation.otherUser.connected ? 'bg-green-500' : 'bg-gray-400'"
              ></div>
            </div>
            <div class="flex flex-col">
              <h2
                @click="toggleProfileModal"
                class="text-base font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                {{ selectedConversation.otherUser.username }}
              </h2>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                <span v-if="selectedConversation.otherUser.connected" class="text-green-500">
                  En ligne
                </span>
                <span v-else-if="selectedConversation.otherUser.lastconnection">
                  {{ formatDate(selectedConversation.otherUser.lastconnection) }}
                </span>
              </p>
            </div>
          </div>
        </div>

        <!-- Messages Container -->
        <div class="flex h-96 flex-col">
          <!-- Messages List -->
          <div
            ref="messagesContainer"
            class="flex-1 space-y-3 overflow-y-auto pr-2 pb-4"
            style="max-height: 320px"
          >
            <div v-if="messagesLoading" class="flex justify-center items-center h-full">
              <p class="text-gray-500 dark:text-gray-400">Chargement des messages...</p>
            </div>

            <div v-else-if="messages.length === 0" class="flex justify-center items-center h-full">
              <p class="text-gray-500 dark:text-gray-400">Aucun message pour le moment</p>
            </div>

            <div
              v-for="message in messages"
              :key="message.id || message.date"
              class="flex"
              :class="message.sender === currentUserId ? 'justify-end' : 'justify-start'"
            >
              <div
                class="max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm"
                :class="
                  message.sender === currentUserId
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white rounded-bl-none'
                "
              >
                <p>{{ message.message }}</p>
                <p class="text-xs opacity-75 mt-1">
                  {{ formatMessageTime(message.date) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="border-t border-gray-200 dark:border-gray-600 pt-4">
            <div class="flex items-center space-x-2">
              <input
                v-model="newMessage"
                @keyup.enter="sendMessage"
                :disabled="sendingMessage"
                type="text"
                placeholder="Tapez votre message..."
                class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-400"
              />

              <button
                @click="sendMessage"
                :disabled="!newMessage.trim() || sendingMessage"
                class="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <svg
                  v-if="sendingMessage"
                  class="size-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <svg v-else class="size-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Modal -->
    <TransitionRoot as="template" :show="showProfileModal">
      <Dialog class="relative z-50" @close="showProfileModal = false">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-gray-500/75 transition-opacity" />
        </TransitionChild>

        <div class="fixed inset-0 z-50 w-screen overflow-y-auto">
          <div
            class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
          >
            <TransitionChild
              as="template"
              enter="ease-out duration-300"
              enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enter-to="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leave-from="opacity-100 translate-y-0 sm:scale-100"
              leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel
                class="relative my-8 w-[90%] max-w-5xl transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all"
              >
                <div v-if="loadingProfile" class="flex justify-center items-center p-8">
                  <p class="text-gray-500 dark:text-gray-400">Chargement du profil...</p>
                </div>
                <profileInfos
                  v-else-if="profileUser && profileUser.user"
                  :user="profileUser.user"
                ></profileInfos>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </aside>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useStore } from "vuex";
import { fetchData } from "../config/api.js";
import DisconnectBtn from "./header/DisconnectBtn.vue";
import ProfileBtn from "./header/ProfileBtn.vue";
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from "@headlessui/vue";
import profileInfos from "./ProfileInfos.vue";

export default {
  name: "Sidebar",
  components: {
    ProfileBtn,
    DisconnectBtn,
    Dialog,
    DialogPanel,
    TransitionChild,
    TransitionRoot,
    profileInfos,
  },
  emits: ["close"],
  setup(_, { emit }) {
    const store = useStore();

    /** Sidebar UI state */
    const showNotifications = ref(false);
    const showChat = ref(false);
    const showChatMessages = ref(false);
    const selectedConversation = ref(null);
    const newMessage = ref("");
    const chatLoading = ref(false);
    const messagesLoading = ref(false);
    const sendingMessage = ref(false);
    const messagesContainer = ref(null);

    /** Profile modal */
    const showProfileModal = ref(false);
    const profileUser = ref(null);
    const loadingProfile = ref(false);

    /** Computed */
    const notifications = computed(() => store.state.notifications.notifications);
    const notificationCount = computed(() => notifications.value.filter((n) => !n.viewed).length);

    const conversations = computed(() => store.state.notifications.conversations);
    const unreadMessagesCount = computed(() =>
      conversations.value.reduce((t, c) => t + (c.unreadCount || 0), 0)
    );

    const messages = computed(() => {
      if (!selectedConversation.value) return [];
      const msgs = store.getters["notifications/getConversationMessages"](
        selectedConversation.value.id
      );
      // console.log("[COMPUTED MESSAGES] Pour conv", selectedConversation.value.id, msgs);
      return msgs;
    });

    const currentUserId = computed(() => localStorage.getItem("userId"));

    /** Sidebar actions */
    const closeSidebar = () => emit("close");

    const openNotifications = async () => {
      showNotifications.value = true;
      showChat.value = false;
      showChatMessages.value = false;
      await fetchNotifications();
      store.commit("notifications/markNotificationsViewed");
    };

    const openChat = async () => {
      showChat.value = true;
      showNotifications.value = false;
      showChatMessages.value = false;
      await fetchConversations();
    };

    const openChatMessages = async (conversation) => {
      selectedConversation.value = conversation;
      showChatMessages.value = true;

      await loadUserProfileForChat(conversation.otherUser.username);
      await fetchMessages(conversation);

      store.commit("notifications/clearUnreadMessages", conversation.id);
      scrollToBottom();
    };

    const backToMain = () => {
      showNotifications.value = false;
      showChat.value = false;
      showChatMessages.value = false;
      selectedConversation.value = null;
    };

    const backToConversations = async () => {
      showChatMessages.value = false;
      selectedConversation.value = null;
      await fetchConversations();
    };

    const deleteNotification = async (notificationId) => {
      await store.dispatch("notifications/deleteNotification", notificationId);
    };

    /** Profile functions */
    const loadUserProfile = async (username) => {
      if (!username) return;
      loadingProfile.value = true;
      try {
        const res = await fetchData(`/profile/${username}`, { method: "GET" });
        if (res.response.ok && res.data) {
          profileUser.value = res.data;
          showProfileModal.value = true;
        }
      } catch (err) {
        // console.error(err);
      } finally {
        loadingProfile.value = false;
      }
    };

    const loadUserProfileForChat = async (username) => {
      if (!username || !selectedConversation.value) return;
      try {
        const res = await fetchData(`/profile/${username}`, { method: "GET" });
        if (res.response.ok && res.data) {
          selectedConversation.value.otherUser = {
            ...selectedConversation.value.otherUser,
            ...res.data.user,
          };
        }
      } catch (err) {
        // console.error(err);
      }
    };

    const toggleProfileModal = async () => {
      if (!showProfileModal.value && selectedConversation.value) {
        await loadUserProfile(selectedConversation.value.otherUser.username);
        sendViewedMessage(selectedConversation.value.otherUser.username);
      } else {
        showProfileModal.value = false;
        profileUser.value = null;
      }
    };

    const openProfileFromNotification = async (notification) => {
      if (!notification.username) return;
      await loadUserProfile(notification.username);
      sendViewedMessage(notification.username);
    };

    const sendViewedMessage = (username) => {
      const ws = store.getters.getWebSocket;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      const viewedMessage = {
        type: "viewed",
        userId: localStorage.getItem("userId"),
        message: { user: store.getters.getUserName, userViewed: username },
      };
      ws.send(JSON.stringify(viewedMessage));
    };

    /** Fetch API */
    const fetchNotifications = async () => {
      try {
        const res = await fetchData("/notifications", { method: "GET" });
        store.commit("notifications/setNotifications", Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        // console.error(err);
        store.commit("notifications/setNotifications", []);
      }
    };

    const fetchConversations = async () => {
      if (chatLoading.value) return;
      chatLoading.value = true;
      try {
        const res = await fetchData("/conversations", { method: "GET" });
        if (res.response.ok && res.data?.conversations)
          store.commit("notifications/setConversations", res.data.conversations);
      } catch (err) {
        // console.error(err);
        store.commit("notifications/setConversations", []);
      } finally {
        chatLoading.value = false;
      }
    };

    const fetchMessages = async (conversation) => {
      if (!conversation || messagesLoading.value) return;
      messagesLoading.value = true;
      try {
        const res = await fetchData(`/conversations/${conversation.id}/messages`, {
          method: "GET",
        });
        if (res.response.ok && res.data?.messages)
          store.commit("notifications/setMessages", {
            conversationId: conversation.id,
            messages: res.data.messages,
          });
      } catch (err) {
        // console.error(err);
        store.commit("notifications/setMessages", {
          conversationId: conversation.id,
          messages: [],
        });
      } finally {
        messagesLoading.value = false;
      }
    };

    /** Send chat message */
    const sendMessage = async () => {
      if (!newMessage.value.trim() || sendingMessage.value || !selectedConversation.value) return;

      const messageText = newMessage.value.trim();
      const tempMessage = {
        id: Date.now().toString(),
        sender: currentUserId.value,
        message: messageText,
        date: new Date(),
        temp: true,
      };

      store.commit("notifications/addMessage", {
        conversationId: selectedConversation.value.id,
        message: tempMessage,
      });
      newMessage.value = "";
      scrollToBottom();

      sendingMessage.value = true;
      try {
        const ws = store.getters.getWebSocket;
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: "chat",
              userId: currentUserId.value,
              message: {
                UserRecipient: selectedConversation.value.otherUser.username,
                message: messageText,
              },
            })
          );
          tempMessage.temp = false;
        }
      } catch (err) {
        // console.error(err);
      } finally {
        sendingMessage.value = false;
      }
    };

    const scrollToBottom = async () => {
      await nextTick();
      if (messagesContainer.value)
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    };

    /** WebSocket centralized handler */
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
      // console.log("[HANDLE INCOMING MESSAGE] Avant commit:", msg);

      store.dispatch("notifications/addIncomingMessage", msg);

      // console.log("[HANDLE INCOMING MESSAGE] selectedConversation:", selectedConversation.value);
      // Si je suis dans la conversation, scroll et mettre à jour
      if (selectedConversation.value && selectedConversation.value.id === msg.conversationId) {
        // Ajoute directement le message dans la conversation affichée
        store.commit("notifications/addMessage", {
          conversationId: msg.conversationId,
          message: msg,
        });
        nextTick(() => {
          if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
          }
        });
      }
    };

    /** Polling as backup */
    let pollingInterval = null;
    const startPolling = () => {
      pollingInterval = setInterval(async () => {
        if (!showNotifications.value) await fetchNotifications();
        if (!showChat.value) await fetchConversations();
      }, 10000);
    };
    const stopPolling = () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };

    /** Mounted */
    onMounted(async () => {
      await fetchNotifications();
      await fetchConversations();
      startPolling();

      const ws = store.getters.getWebSocket;
      if (ws && !ws._sidebarListenerAttached) {
        ws._sidebarListenerAttached = true;

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            // // console.log("[WS MESSAGE RECEIVED]", data);

            // Notifications
            if (["notification", "like", "match", "unlike", "profile_view"].includes(data.type)) {
              // console.log("[WS NOTIF] Handling notification", data);
              handleIncomingNotification(data);
            }

            // Chat messages
            if (data.type === "chat" && data.message) {
              // console.log("[WS CHAT] Handling chat message", data);
              handleIncomingMessage(data);
            }
          } catch (err) {
            // console.error("[WS ERROR] parsing message", err);
          }
        };
      }
    });

    onUnmounted(() => stopPolling());

    /** Helpers */
    const getFirstPhoto = (photoData) => {
      if (!photoData) return null;
      let photo = Array.isArray(photoData) ? photoData[0] : photoData;
      if (typeof photo === "string" && photo.includes(",")) photo = photo.split(",")[0];
      if (!photo) return null;
      const baseURL = process.env.VUE_APP_API_URL || "http://localhost:3000";
      return photo.startsWith("http") ? photo : `${baseURL}${photo.replace(/^\/app/, "")}`;
    };

    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const now = new Date();
      const diffMins = Math.floor((now - date) / 60000);
      const diffHours = Math.floor((now - date) / 3600000);
      const diffDays = Math.floor((now - date) / 86400000);
      if (diffMins < 1) return "À l'instant";
      if (diffMins < 60) return `Il y a ${diffMins}min`;
      if (diffHours < 24) return `Il y a ${diffHours}h`;
      if (diffDays < 7) return `Il y a ${diffDays}j`;
      return date.toLocaleDateString("fr-FR");
    };

    const formatMessageTime = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const now = new Date();
      const diffHours = Math.floor((now - date) / 3600000);
      if (diffHours < 24)
        return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
    };

    return {
      // state
      showNotifications,
      showChat,
      showChatMessages,
      selectedConversation,
      newMessage,
      chatLoading,
      messagesLoading,
      sendingMessage,
      messagesContainer,
      showProfileModal,
      profileUser,
      loadingProfile,
      // computed
      notifications,
      notificationCount,
      conversations,
      unreadMessagesCount,
      messages,
      currentUserId,
      // actions
      closeSidebar,
      openNotifications,
      openChat,
      openChatMessages,
      backToMain,
      backToConversations,
      sendMessage,
      toggleProfileModal,
      openProfileFromNotification,
      getFirstPhoto,
      formatDate,
      formatMessageTime,
      deleteNotification,
    };
  },
};
</script>

<style scoped>
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slideIn {
  animation: slideIn 0.3s ease-out;
}
</style>
