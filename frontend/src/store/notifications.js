export default {
  namespaced: true,
  state: {
    notifications: [],
    conversations: [], // toutes les conversations
    messages: {}, // messages par conversation { [conversationId]: [...] }
  },
  getters: {
    notificationCount: (state) => state.notifications.filter((n) => !n.viewed).length,

    unreadMessagesCount: (state) =>
      state.conversations.reduce((t, c) => t + (c.unreadCount || 0), 0),

    getConversationMessages: (state) => (conversationId) => state.messages[conversationId] || [],
  },
  mutations: {
    // Notifications
    setNotifications(state, list) {
      state.notifications = list;
    },
    addNotification(state, notif) {
      state.notifications.unshift(notif);
    },
    markNotificationsViewed(state) {
      state.notifications = state.notifications.map((n) => ({
        ...n,
        viewed: true,
      }));
    },

    // Conversations
    setConversations(state, list) {
      state.conversations = list;
    },
    updateConversation(state, conversation) {
      const i = state.conversations.findIndex((c) => c.id === conversation.id);
      if (i !== -1) state.conversations[i] = conversation;
      else state.conversations.unshift(conversation);
    },
    incrementUnreadMessage(state, conversationId) {
      const conv = state.conversations.find((c) => c.id === conversationId);
      if (conv) conv.unreadCount = (conv.unreadCount || 0) + 1;
    },
    clearUnreadMessages(state, conversationId) {
      const conv = state.conversations.find((c) => c.id === conversationId);
      if (conv) conv.unreadCount = 0;
    },

    // Messages
    setMessages(state, { conversationId, messages }) {
      state.messages[conversationId] = messages;
    },
    addMessage(state, { conversationId, message }) {
      if (!state.messages[conversationId]) state.messages[conversationId] = [];
      state.messages[conversationId].push(message);
    },
  },
  actions: {
    addIncomingMessage({ commit, state }, messageData) {
      const conversationId = messageData.conversationId;

      // Vérifier si le message existe déjà
      const existingMessages = state.messages[conversationId] || [];
      const isDuplicate = existingMessages.some(
        (msg) => msg.message === messageData.message && msg.date === messageData.date
      );
      if (isDuplicate) return;

      commit("addMessage", { conversationId, message: messageData });

      // Incrémenter unread uniquement si le message vient d’un autre utilisateur
      if (messageData.sender !== localStorage.getItem("userName")) {
        const conv = state.conversations.find((c) => c.id === conversationId);
        if (conv) {
          commit("incrementUnreadMessage", conversationId);
          conv.hasUnreadMessages = true;
        } else {
          commit("updateConversation", {
            id: conversationId,
            otherUser: messageData.senderUser,
            lastMessage: messageData,
            unreadCount: 1,
            hasUnreadMessages: true,
          });
        }
      }
    }

  },
};
