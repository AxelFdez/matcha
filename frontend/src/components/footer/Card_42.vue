<template>
  <div class="col--infos--42">
    <div class="card--42--title">
      <h1>42 nice</h1>
    </div>
    <a :href="ecole_infos.website" target="_blank" rel="nofollow"
      ><img :src="ecole_infos.img" alt="42_logo"
    /></a>
    <h5>
      {{ ecole_infos.address }} <br />
      {{ ecole_infos.cp }}
    </h5>
    <div class="contact--42--icons">
      <a :href="ecole_infos.instagram" target="_blank" rel="nofollow"
        ><i class="fab fa-instagram"></i
      ></a>
      <a :href="ecole_infos.linkedin" target="_blank" rel="nofollow"
        ><i class="fab fa-linkedin"></i
      ></a>
      <a :href="ecole_infos.facebook" target="_blank" rel="nofollow"
        ><i class="fab fa-square-facebook"></i
      ></a>
    </div>
  </div>
</template>

<script>
import { ecole_infos } from "../../data/data.js";
export default {
  name: "Card_42",
  data() {
    return {
      ecole_infos,
    };
  },
};
</script>

<style lang=scss>
.col--infos--42 {
  margin: 10px 0 10px 0;
  padding: 0px 0px 10px 0px;

  //   border: solid 1px red;
  box-shadow: 0 0 6px var(--gray);

  width: 32%;
  height: auto;
  display: grid;
  align-items: center;
  justify-content: center;
  //   padding-bottom: 15px;
  .card--42--title {
    color: var(--gray);
    text-align: center;
    text-transform: capitalize;
    h1 {
      margin: 0px;
      font-weight: 900;
      padding-bottom: 18px;
    }
  }
  a {
    display: flex;
    justify-content: center;
    img {
      width: 80%;
      border-radius: 5px;
      cursor: pointer;
      transition: ease-in-out 0.3s;
      box-shadow: 0 0 6px rgb(0, 169, 191);
      &:hover {
        transform: scale(1.03);
      }
    }
  }
  h5 {
    margin: 10px;
    text-align: center;
    font-size: 1.1rem;
    color: var(--dark-gray);
  }
  .contact--42--icons {
    width: 100%;
    display: flex;
    justify-content: space-around;
    font-size: 2.7rem;
    a {
      cursor: pointer;
      color: var(--pink);
      transition: all 0.3s;

      &:hover {
        color: var(--gray);
        transform: scale(1.08);
      }
    }
  }
  @media (min-width: 200px) and (max-width: 1115px) {
    width: 90vw;
    margin: 10px 0 0px 0;
    padding: 15px 0 25px 0;
    h1 {
      padding-bottom: 10px;
      font-weight: 900;
    }
  }
}
</style>