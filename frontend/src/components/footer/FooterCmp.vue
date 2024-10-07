<template>
  <footer>
    <div class="footer">
      <div class="footer--content">
        <CardTeam></CardTeam>
        <CardContacts></CardContacts>
        <Card_42></Card_42>
      </div>
      <AboutProject></AboutProject>
      <div class="copyright">&copy; 2024 Axel Fernandez / Christophe Massa</div>
    </div>
  </footer>
</template>

<script>
import AboutProject from "./AboutProject.vue";
import CardTeam from "./card_team/CardTeam.vue";
import CardContacts from "./card_contacts/CardContacts.vue";
import Card_42 from "./Card_42.vue";
export default {
  name: "FooterCmp",
  components: {
    AboutProject,
    CardTeam,
    CardContacts,
    Card_42,
  },
};
</script>

<style lang=scss>
footer {
  border-top: 3px solid var(--pink);
}
.footer {
  max-width: 2100px;
  height: auto;
  margin: 0px auto 0px auto;
  background: #ffffff;

  .footer--content {
    margin: 25px 10px 25px 10px;

    display: flex;
    align-items: top;
    justify-content: space-around;
    @media (min-width: 200px) and (max-width: 1115px) {
      display: grid;
      justify-items: center;
    }
  }
  .copyright {
    color: var(--gray);
    font-size: 0.8rem;
    display: grid;
    justify-content: end;
    padding: 0px 35px 10px 10px;

    @media (min-width: 200px) and (max-width: 1115px) {
      justify-content: center;
      padding-bottom: 10px;
    }
  }
}
</style>