<template>
  <div class="disconnect-btn" @click="logout()">
    <span><i class="fa-solid fa-right-from-bracket"></i></span>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { useRouter } from "vue-router";
export default {
  name: "DisconnectBtn",

  setup() {
    const store = useStore();
    const router = useRouter();

    const logout = () => {
      store.commit("setIsLoading", true);
      console.log("logout function");

      setTimeout(() => {
        store.commit("setIsConnected", false);
        store.commit("setUserName", "");
        localStorage.clear();
        if (store.getters.getWebSocket) {
          store.getters.getWebSocket.close();
        }
        router.push({ name: "HomePage" });
        store.commit("setIsLoading", false);
      }, 3000);
    };

    return {
      logout,
    };
  },
};
</script>

<style lang="scss">
.disconnect-btn {
  text-decoration: none;
  display: flex;
  justify-content: center;
  margin: 0 10px 0 10px;

  span {
    display: grid;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 35px;
    border-radius: 6px;
    background-image: linear-gradient(to right, #ff24a7, #8890fe);
    cursor: pointer;
    user-select: none;
    opacity: 1;
    transition: all 0.2s;
    font-size: 1.6rem;
    color: white;
    margin-top: 1px;

    &:hover {
      
      background-image: linear-gradient(to right, #ff24a796, #8890fe8e);
      box-shadow: 0 0 8px #0000008c;
    }
  }

  @media (min-width: 200px) and (max-width: 700px) {
    margin: 5px 10px 0px 10px;

    span {
      width: 35px;
      height: 25px;
      font-size: 1.2rem;
    }
  }
}
</style>
