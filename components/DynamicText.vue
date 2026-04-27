<script>
export default {
  props: {
    html: {
      type: String
    }
  },
  computed: {
    dynamicComponent() {
      return {
        template: `<p>${this.html}</p>`
      };
    }
  },
  render(createElement, context) {
    return createElement(this.dynamicComponent, {
      props: {}
    })
  }
};
</script>
