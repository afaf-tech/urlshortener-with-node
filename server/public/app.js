const app = new Vue({
  el: "#app",
  data: {
    url: null,
    slug: null,
    created: null,
  },
  methods: {
    async createUrl() {
      if (this.slug == null) {
        data = {
          url: this.url,
        };
      } else {
        data = {
          url: this.url,
          slug: this.slug,
        };
      }
      console.log(this.url, this.slug);
      const response = await fetch("/url", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      });

      data = null;

      this.created = await response.json();
    },
  },
});
