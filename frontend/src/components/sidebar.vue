<template>
  <button data-drawer-target="default-sidebar" data-drawer-toggle="default-sidebar" aria-controls="default-sidebar"
    type="button"
    class="ml-3 mt-2 inline-flex items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 sm:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
    <span class="sr-only">Open sidebar</span>
    <svg class="size-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path clip-rule="evenodd" fill-rule="evenodd"
        d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z">
      </path>
    </svg>
  </button>

  <aside id="default-sidebar"
    class="fixed right-0 top-20 z-40 h-screen w-64 -translate-x-full transition-transform sm:translate-x-0"
    aria-label="Sidenav">
    <div
      class="h-full overflow-y-auto border-r border-gray-200 bg-white px-3 py-5 dark:border-gray-700 dark:bg-gray-800">
      <!-- Main Sidebar Content -->
      <div v-if="!showNotifications && !showChat">
        <ul class="space-y-2">
          <li>
            <button @click="openNotifications"
              class="group flex w-full items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">
              <svg
                class="size-6 text-gray-400 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z">
                </path>
              </svg>
              <span class="ml-3 flex-1 text-left">Notifications</span>
              <span v-if="notificationCount > 0"
                class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                {{ notificationCount }}
              </span>
            </button>
          </li>
          <li>
            <button @click="openChat"
              class="group flex w-full items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">
              <svg
                class="size-6 text-gray-400 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 5A2 2 0 014 3h12a2 2 0 012 2v8a2 2 0 01-2 2H7l-3 3V5z">
                </path>
              </svg>
              <span class="ml-3 flex-1 text-left">Chat</span>
              <span v-if="unreadMessagesCount > 0"
                class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
                {{ unreadMessagesCount }}
              </span>
            </button>
          </li>
        </ul>
      </div>

      <!-- Notifications Content -->
      <div v-if="showNotifications">
        <div class="mb-4 flex items-center">
          <button @click="backToMain"
            class="mr-3 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
            <svg class="size-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clip-rule="evenodd"></path>
            </svg>
          </button>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Notifications
          </h2>
        </div>

        <!-- Notifications List -->
        <div class="space-y-2">
          <div v-if="notifications.length === 0" class="rounded-lg p-4 text-center text-gray-500 dark:text-gray-400">
            Aucune notification
          </div>

          <div v-for="notification in notifications" :key="notification.id"
            class="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-600 dark:bg-gray-700"
            :class="{
              'border-l-4 border-l-blue-500': !notification.viewed,
              'opacity-75': notification.viewed
            }">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ notification.title }}
                </p>
                <p v-if="notification.message" class="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {{ notification.message }}
                </p>
                <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  {{ formatDate(notification.createdAt) }}
                </p>
              </div>
              <button @click="deleteNotification(notification.id)"
                class="ml-2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300">
                <svg class="size-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Content -->
      <div v-if="showChat && !showChatMessages">
        <div class="mb-4 flex items-center">
          <button @click="backToMain"
            class="mr-3 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
            <svg class="size-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clip-rule="evenodd"></path>
            </svg>
          </button>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Chat
          </h2>
        </div>

        <!-- Conversations List -->
        <div class="space-y-2">
          <div v-if="chatLoading" class="rounded-lg p-4 text-center text-gray-500 dark:text-gray-400">
            Chargement...
          </div>

          <div v-else-if="conversations.length === 0"
            class="rounded-lg p-4 text-center text-gray-500 dark:text-gray-400">
            Aucune conversation
          </div>

          <div v-for="conversation in conversations" :key="conversation.id" @click="openChatMessages(conversation)"
            class="cursor-pointer rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
            :class="{
              'border-l-4 border-l-blue-500': conversation.hasUnreadMessages,
            }">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="size-10 flex-shrink-0">
                  <img v-if="conversation.otherUser.avatar" :src="conversation.otherUser.avatar"
                    :alt="conversation.otherUser.username" class="size-10 rounded-full object-cover">
                  <div v-else
                    class="size-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 dark:bg-gray-600 dark:text-gray-300">
                    {{ conversation.otherUser.username.charAt(0).toUpperCase() }}
                  </div>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ conversation.otherUser.username }}
                  </p>
                  <p v-if="conversation.lastMessage" class="text-sm text-gray-600 dark:text-gray-300 truncate">
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
                <span v-if="conversation.unreadCount > 0"
                  class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
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
          <button @click="backToConversations"
            class="mr-3 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
            <svg class="size-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clip-rule="evenodd"></path>
            </svg>
          </button>
          <div class="flex items-center space-x-2">
            <div class="size-8 flex-shrink-0">
              <img v-if="selectedConversation.otherUser.avatar" :src="selectedConversation.otherUser.avatar"
                :alt="selectedConversation.otherUser.username" class="size-8 rounded-full object-cover">
              <div v-else
                class="size-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 dark:bg-gray-600 dark:text-gray-300 text-xs">
                {{ selectedConversation.otherUser.username.charAt(0).toUpperCase() }}
              </div>
            </div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ selectedConversation.otherUser.username }}
            </h2>
          </div>
        </div>

        <!-- Messages Container -->
        <div class="flex h-96 flex-col">
          <!-- Messages List -->
          <div ref="messagesContainer" class="flex-1 space-y-3 overflow-y-auto pr-2 pb-4" style="max-height: 320px;">

            <div v-if="messagesLoading" class="flex justify-center items-center h-full">
              <p class="text-gray-500 dark:text-gray-400">Chargement des messages...</p>
            </div>

            <div v-else-if="messages.length === 0" class="flex justify-center items-center h-full">
              <p class="text-gray-500 dark:text-gray-400">Aucun message pour le moment</p>
            </div>

            <div v-for="message in messages" :key="message.id || message.date" class="flex"
              :class="message.sender === currentUserId ? 'justify-end' : 'justify-start'">

              <div class="max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm" :class="message.sender === currentUserId
                ? 'bg-blue-500 text-white rounded-br-none'
                : 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white rounded-bl-none'">
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
              <input v-model="newMessage" @keyup.enter="sendMessage" :disabled="sendingMessage" type="text"
                placeholder="Tapez votre message..."
                class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-400">

              <button @click="sendMessage" :disabled="!newMessage.trim() || sendingMessage"
                class="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700">
                <svg v-if="sendingMessage" class="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
                <svg v-else class="size-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z">
                  </path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { fetchData } from '../config/api.js'
import { useStore } from 'vuex'

// Declare custom events
const emit = defineEmits(['close'])

const store = useStore();

// Notifications
const showNotifications = ref(false)
const notifications = ref([])
const loading = ref(false)

// Chat
const showChat = ref(false)
const showChatMessages = ref(false)
const conversations = ref([])
const selectedConversation = ref(null)
const messages = ref([])
const newMessage = ref('')
const chatLoading = ref(false)
const messagesLoading = ref(false)
const sendingMessage = ref(false)
const messagesContainer = ref(null)

// Computed properties
const notificationCount = computed(() => {
  return notifications.value.filter(n => !n.viewed).length
})

const unreadMessagesCount = computed(() => {
  return conversations.value.reduce((count, conv) => count + (conv.unreadCount || 0), 0)
})

const currentUserId = computed(() => {
  return localStorage.getItem("userId")
})

// Navigation functions
const openNotifications = async () => {
  showNotifications.value = true
  showChat.value = false
  showChatMessages.value = false
  await fetchNotifications()
}

const openChat = async () => {
  showChat.value = true
  showNotifications.value = false
  showChatMessages.value = false
  await fetchConversations()
}

const openChatMessages = async (conversation) => {
  selectedConversation.value = conversation
  showChatMessages.value = true
  await fetchMessages(conversation)
  scrollToBottom()
}

const backToMain = () => {
  showNotifications.value = false
  showChat.value = false
  showChatMessages.value = false
  selectedConversation.value = null
}

const backToConversations = () => {
  showChatMessages.value = false
  selectedConversation.value = null
}

const fetchNotifications = async () => {
  if (loading.value) return

  loading.value = true
  try {
    const response = await fetchData('/notifications', {
      method: 'GET'
    })
    notifications.value = response.data || []

    // Mark notifications as viewed via WebSocket
    if (notifications.value.length > 0) {
      const ws = store.getters.getWebSocket;
      const userId = localStorage.getItem("userId");
      ws.send(
        JSON.stringify({
          type: "notification",
          userId: userId,
        })
      );

      // Update local state to mark notifications as viewed
      setTimeout(() => {
        notifications.value = notifications.value.map(n => ({ ...n, viewed: true }))
      }, 100) // Small delay to ensure WebSocket message is processed
    }
  } catch (error) {
    console.error('Erreur lors du chargement des notifications:', error)
    notifications.value = []
  } finally {
    loading.value = false
  }
}

const deleteNotification = async (notificationId) => {
  try {
    await fetchData(`/notifications/${notificationId}`, { method: 'DELETE' })
    notifications.value = notifications.value.filter(n => n.id !== notificationId)
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error)
  }
}

// Chat functions
const fetchConversations = async () => {
  if (chatLoading.value) return

  chatLoading.value = true
  try {
    const response = await fetchData('/conversations', {
      method: 'GET'
    })

    if (response.response.ok && response.data && response.data.conversations) {
      conversations.value = response.data.conversations
    } else {
      console.log('No conversations found or error occurred', response)
      conversations.value = []
    }
  } catch (error) {
    console.error('Erreur lors du chargement des conversations:', error)
    conversations.value = []
  } finally {
    chatLoading.value = false
  }
}

const fetchMessages = async (conversation) => {
  if (messagesLoading.value) return

  messagesLoading.value = true
  try {
    const response = await fetchData(`/conversations/${conversation.id}/messages`, {
      method: 'GET'
    })

    if (response.response.ok && response.data && response.data.messages) {
      messages.value = response.data.messages
    } else {
      console.log('No messages found for conversation:', conversation.id, response)
      messages.value = []
    }
  } catch (error) {
    console.error('Erreur lors du chargement des messages:', error)
    messages.value = []
  } finally {
    messagesLoading.value = false
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || sendingMessage.value || !selectedConversation.value) return

  const messageText = newMessage.value.trim()
  const tempMessage = {
    id: Date.now().toString(),
    sender: currentUserId.value,
    message: messageText,
    date: new Date(),
    temp: true
  }

  // Add message to UI immediately
  messages.value.push(tempMessage)
  newMessage.value = ''
  scrollToBottom()

  sendingMessage.value = true

  try {
    const ws = store.getters.getWebSocket
    const userId = localStorage.getItem("userId")

    if (ws && ws.readyState === WebSocket.OPEN) {
      // Send via WebSocket following the existing pattern
      ws.send(JSON.stringify({
        type: "chat",
        userId: userId,
        message: {
          UserRecipient: selectedConversation.value.otherUser.username,
          message: messageText
        }
      }))

      // Remove temp flag
      const messageIndex = messages.value.findIndex(m => m.id === tempMessage.id)
      if (messageIndex !== -1) {
        messages.value[messageIndex].temp = false
      }
    } else {
      throw new Error('WebSocket connection not available')
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error)
    // Remove failed message
    messages.value = messages.value.filter(m => m.id !== tempMessage.id)
  } finally {
    sendingMessage.value = false
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const handleIncomingMessage = (messageData) => {
  // Handle incoming WebSocket messages
  if (messageData.type === 'chat') {
    const newMsg = {
      id: messageData.message.id || Date.now().toString(),
      sender: messageData.message.sender,
      message: messageData.message.message,
      date: new Date(messageData.message.date),
      senderUsername: messageData.message.sender_username
    }

    // Add to current conversation if it matches
    if (selectedConversation.value &&
      (messageData.message.sender === selectedConversation.value.otherUser.id.toString() ||
        messageData.message.sender_username === selectedConversation.value.otherUser.username)) {
      messages.value.push(newMsg)
      scrollToBottom()
    }

    // Update conversation list
    const conversationIndex = conversations.value.findIndex(conv =>
      conv.otherUser.id.toString() === messageData.message.sender ||
      conv.otherUser.username === messageData.message.sender_username
    )

    if (conversationIndex !== -1) {
      conversations.value[conversationIndex].lastMessage = {
        id: newMsg.id,
        message: newMsg.message,
        sender: newMsg.sender,
        date: newMsg.date
      }
      conversations.value[conversationIndex].unreadCount = (conversations.value[conversationIndex].unreadCount || 0) + 1
      conversations.value[conversationIndex].hasUnreadMessages = true
    }
  }
}

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins}min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`
  return date.toLocaleDateString('fr-FR')
}

const formatMessageTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffHours = Math.floor((now - date) / 3600000)

  if (diffHours < 24) {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
  }
}

onMounted(() => {
  // Initial fetch to get notification count
  // fetchNotifications()

  // Set up WebSocket listeners for incoming chat messages
  const ws = store.getters.getWebSocket
  if (ws) {
    // Store original onmessage handler to avoid overriding
    const originalOnMessage = ws.onmessage

    ws.onmessage = function (messageEvent) {
      // Call original handler first
      if (originalOnMessage) {
        originalOnMessage.call(this, messageEvent)
      }

      // Handle chat messages
      try {
        const data = JSON.parse(messageEvent.data)
        handleIncomingMessage(data)
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }
  }
})
</script>
