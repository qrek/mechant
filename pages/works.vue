<template>
  <section class="worksPage">
    <nav class="worksPage_filters">
      <ul>
        <li class="worksPage_filters_item" :class="{active: isActive('all')}" @click="setActiveFilter('all')">All</li>
        <li v-for="(filter, index) in categoriesData" :key="index" class="worksPage_filters_item" :class="{active: isActive(filter.id)}" @click="setActiveFilter(filter.id)">{{ filter.title }}</li>
      </ul>
    </nav>

    <div class="worksPage_star star1" ref="star1">
      <span class="icon-star2"></span>
    </div>
    <div class="worksPage_star star2" ref="star2">
      <span class="icon-star"></span>
    </div>
    <div class="worksPage_star star3" ref="star3">
      <span class="icon-star2"></span>
    </div>
    <div  class="worksPage_star star4" ref="star4">
      <span class="icon-star3"></span>
    </div>

    <div class="worksPage_projects" ref="projectWrapper">
      <ProjectList ref="projectList" :projects="projectsData" />
    </div>

    <!--<Button-->
    <!--  text="Load more"-->
    <!--  background="pink"-->
    <!--  color="white"-->
    <!--  :customClass="`laadMoreButton ${isLoading ? 'disabled' : ''}`"-->
    <!--  :onClick="loadMore"-->
    <!--  v-if="!hideLoadMoreButton"-->
    <!--/>-->
  </section>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { gsap } from '@/vendor/gsap'
import { getFormattedData } from '@/utils/data'

import ProjectList from "@/components/ProjectList"

import customPageTransitions from '@/mixins/customPageTransitions'

import TransitionManager from '@/utils/TransitionManager'
import {TRANSITION_LEAVE_END} from '@/store/router'
import webgl from "@/mixins/webgl";

export default {
  name: 'Works',
  components: {
    ProjectList
  },
  mixins: [customPageTransitions, webgl],
  head() {
    return {
      title: this.projectsPageData.meta_title,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.projectsPageData.meta_description
        }
      ]
    }
  },
  data() {
    return {
      hideLoadMoreButton: false,
      isLoading: false,
      tween: {}
    }
  },
  computed: {
    ...mapGetters({
      data: 'data/getData',
      filter: 'data/getFilter'
    }),
    projectsData() {
      return this.data.projects
    },
    categoriesData() {
      return Object.values(this.data.categories)
    },
    projectsPageData() {
      return this.data.projectsPage
    }
  },
  mounted() {
    const transitionManager = new TransitionManager()

    transitionManager.addEventListener(TRANSITION_LEAVE_END, () => {
      this.setFilter('all')
    })

    gsap.to([this.$refs.star1, this.$refs.star3, this.$refs.star2, this.$refs.star4], {
      duration: 2,
      stagger: 0.1,
      scale: 1,
      delay: 0.8,
      ease: "elastic.out"
    })
  },
  methods: {
    ...mapActions({
      setFilter: 'data/setFilter',
      setData: 'data/setData'
    }),
    checkTween(key) {
      if (this.tween[key]) {
        this.tween[key].kill()
        this.tween[key] = null
      }
    },
    isActive(filter) {
      return filter === this.filter
    },
    setActiveFilter(filter) {
      this.setFilter(filter)
    },
    onSoftInit() {
      const { projectWrapper, projectList } = this.$refs
      gsap.set(projectWrapper, { height: projectList.$el.clientHeight })
      window.addEventListener('scroll', this.handleScroll)
      this.handleScroll()
    },
    onSoftDestroy() {
      window.removeEventListener('scroll', this.handleScroll)
    },
    handleScroll() {
      const { projectList } = this.$refs
      const { bottom } = projectList.$el.getBoundingClientRect()
      const limit = window.innerHeight * (4 / 3)
      if (bottom < limit && !this.hideLoadMoreButton && !this.isLoading) {
        this.loadMore()
      }
    },
    async loadMore() {
      this.isLoading = true
      const { page, total_pages } = this.data.pagination

      if(page < total_pages) {
        this.checkTween('wrapper')

        const projects = await this.$prismic.api.query(this.$prismic.predicates.at('document.type','project'), {
          lang: 'en-gb',
          pageSize: 5,
          page: page + 1,
          orderings: '[document.first_publication_date desc]'
        })
        const formatedProjects = projects.results.map(p => ({ ...getFormattedData(p.data), id: p.id }), []).reduce((a, v) => ({ ...a, [v.id]: v}), {})

        this.setData({
          ...this.data,
          projects: [ ...this.data.projects, ...Object.values(formatedProjects) ],
          pagination: projects
        })

        this.$refs.projectList.handleLoadMore(formatedProjects)

        if(projects.page === projects.total_pages)
          this.hideLoadMoreButton = true

        const { projectWrapper, projectList } = this.$refs

        this.$nextTick(() => {
          this.tween.wrapper = gsap.timeline()
          this.tween.wrapper.to(projectWrapper, { height: projectList.$el.clientHeight })
        })
      }

      this.isLoading = false
    }
  }
}
</script>

<style lang="sass" scoped>
.worksPage
  width: 100%
  display: flex
  align-items: center
  justify-content: flex-start
  flex-direction: column
  padding-top: 15rem
  overflow: hidden

  &_projects
    width: 100%
    display: flex
    align-items: flex-start
    justify-content: center

  &_filters
    position: relative
    z-index: 2

    ul
      display: flex
      justify-content: center
      align-items: center

    &_item
      text-transform: uppercase
      font-family: $kobeBold
      color: $white
      margin: 0 1.5rem
      font-size: 1.4rem
      cursor: pointer
      transition: color 0.3s ease

      &.active, &:hover
        color: $orange

  &_star
    position: fixed
    transform: scale(0)

    +breakpoint(mobile)
      display: none

    span
      display: block

    &.star1
      font-size: 7rem
      color: $pink
      top: 60%
      left: 3%

      span
        @include animateStar(5s, 0.5s)

    &.star2
      position: absolute
      font-size: 7.5rem
      color: $white
      top: 9%
      left: 20%

      span
        @include animateStar(7s, 0.4s)

    &.star3
      font-size: 4rem
      color: $white
      top: 50%
      right: 4%

      span
        @include animateStar(3s, 0s)

    &.star4
      position: absolute
      font-size: 4rem
      color: $orange
      top: 9%
      right: 20%

      span
        @include animateStar(4s, 0.2s)

  .laadMoreButton
    margin: -15rem 0 15rem

    &.disabled
      opacity: 0.5
      pointer-events: none

    +breakpoint(mobile)
      margin: -8rem 0 10rem
</style>
