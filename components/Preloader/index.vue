<template>
  <div class="preloader" :class="{ hidden: hideLoader }">
    <div ref="bg" class="preloader_background" />
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        viewBox="0 0 1900 1080" xml:space="preserve" preserveAspectRatio="none" ref="svg" class="svg" :style="`${isMobile ? 'transform: scaleX(2);' : ''}`">
      <g ref="panel_wrapper" id="panel_wrapper" style="transform-origin: center;">
        <g ref="line" id="line">
          <path fill="#FFFFFF" d="M1977.5,621.6l-44.3-73.3l-23.5,39.6l-31.5-29.7c-2.4,1.9-8.7,6.8-15.2,11.6c-17.3,12.7-19,12-20.2,11.5
            c-0.7-0.3-1.1-0.9-1.2-1.6c-0.4-3.6-6.1-42.4-7.8-54.1l-46.9,56.6l-1.1-1.9c-0.6-1.1-14.7-25.9-17.5-31.6
            c-3.6-0.5-24.1,13-41.3,26.1l-1.8,1.4l-6.3-24.9l-45.4,24.5l-0.6-1.6c-9.8-25.2-22.2-51.9-26-53c0,0,0,0-0.1,0
            c-4.7,0-37.6,29.6-66.8,58.3l-1,1l-1.1-1c-32-30.4-41.2-39.5-43.9-42.5c-5.3,2.7-33.7,20.1-52.7,31.9l-0.9,0.6l-0.8-0.7
            c-3.6-2.9-34.7-28.2-38.5-33.6c-3.7,0.2-22.6,14.9-38.3,28.8l-1.4,1.2l-17.7-32.6l-62,38.3l-0.8-1.2c-0.6-1-15.8-23.7-18.7-31.3
            c-0.5-0.2-3.3-0.6-16.1,5.2c-8.8,3.9-19.4,9.4-29.7,14.7c-14.5,7.5-27,13.9-31.3,14.5c-1.5,0.2-2.8-0.2-3.9-1.3
            c-4.2-4.2-2.5-18-0.1-34.2c0.6-3.7,1.1-7.1,1.2-9c-6.7,2.9-35.9,26.3-61.7,48.3l-1,0.9l-36.4-34.9l-59,32.9l-0.8-0.7
            c-3.6-3.2-20.8-19-23.8-23.9c-4.2,0.8-25.1,14.3-43.6,27.6l-1.7,1.2l-11.5-41.9l-76.4,24.5l-0.5-1.2c-0.1-0.3-12-27.5-17.4-33.8
            c-2.9-0.6-16.1,16.1-24,26c-12.8,16.2-20.9,26.1-25.4,26.6c-2.9,0.3-7.7-2-16.3-25.7c-3.5-9.6-6.3-19.4-7.5-23.6l-49.3,35.6
            l-25-41l-102.4,45.5l-29.7-37.9l-39.3,38.3l-35.2-43.7l-35.5,37.4l-18.7-36l-32.8,30.8l-29.1-31.3L375,558.5l-0.8-0.5
            c-12.2-7.2-50.6-30-56-35.9c-5.2,1.7-34.5,24.5-60.4,45.9l-1.4,1.1l-28.2-48.9l-101.6,42.6L104,511.1l-65.7,45.7l-0.9-0.7
            c-0.5-0.4-47-38.1-53.6-41.8c-2.3-0.8-14.5,11.1-38.5,46.9c-1,1.4-1.6,2.4-1.8,2.7l-16.5,47.1l-2.8-1l16.6-47.5l0.1-0.2
            c0,0,0.7-1.1,1.9-2.9c3.4-5.1,12.3-18.2,20.9-29.2c14.7-18.8,19.1-20,21.6-18.7c6.5,3.6,46.5,36,53.2,41.4l66.8-46.5l22.9,52.4
            l101.3-42.5l27.7,48.1c3.9-3.2,15.8-13,27.9-22.5c30.4-23.9,32.6-23.3,33.9-23c0.6,0.1,1.1,0.5,1.3,1.1c1.8,3,34,22.7,54.4,34.7
            l43.8-30.7l28.9,31l33.5-31.5l18.6,35.8l34.9-36.9l35.2,43.8l39.4-38.3l30.3,38.7L742,521.3l24.7,40.5l50.1-36.3l0.6,2.1
            c0,0.1,3.5,12.9,8,25.4c8.3,23.1,12.4,23.9,13.1,23.8c3.5-0.4,14.5-14.3,23.4-25.5c13.3-16.8,21.7-27.1,26.3-27.2
            c0.9,0,1.8,0.3,2.3,1c5,5.8,14.8,27.7,17.3,33.3l76.8-24.6l11.2,40.8c3.4-2.4,11.2-7.9,19.3-13.2c22.1-14.6,24.3-14,25.5-13.6
            c0.6,0.2,1.1,0.6,1.3,1.1c1,2.5,14.1,14.9,22.6,22.7l59-33l36.1,34.6c3.6-3.1,16.3-13.8,29.3-24.3c31.5-25.5,33.8-24.5,35.2-24
            c0.7,0.3,1.1,0.9,1.2,1.7c0.1,1.7-0.4,5.6-1.2,10.9c-1.5,9.8-4.2,28.1-0.7,31.6c0.4,0.4,0.7,0.5,1.3,0.4
            c3.8-0.5,16.7-7.2,30.4-14.2c25.9-13.3,43.3-21.9,48.3-20c1,0.4,1.5,1.1,1.7,1.6c2.4,6.3,14.5,24.7,17.7,29.6l62.2-38.4l17.5,32.1
            c9.2-8.1,32.9-28.3,39.2-28.3c0.1,0,0.3,0,0.4,0c0.7,0.1,1.4,0.5,1.7,1.1c1.8,3.1,22.9,20.9,37.1,32.5c3.2-2,14.5-8.9,25.7-15.8
            c27.4-16.7,27.6-16.6,28.7-16.1l0.7,0.4l0,0.4c2.6,2.9,26.5,25.9,43.1,41.6c3.7-3.7,17-16.5,30.7-29.1
            c33.1-30.4,36.5-29.4,38.1-28.9c6.7,2,22.7,41.7,27.3,53.2l45.8-24.7l6.1,24.2c10.4-7.8,36.2-26.6,42.2-25.2
            c0.8,0.2,1.4,0.7,1.7,1.4c2.1,4.4,13,23.6,16.5,29.8l48.4-58.4l0.5,3.3c0.3,2.1,7.1,48,8.2,56.5c4.2-1.5,19.5-12.6,32.9-23.3
            l1-0.8l30.6,29l24.1-40.7l46.9,77.6L1977.5,621.6z M1536,535L1536,535C1536,535,1536,535,1536,535z M317.6,521.4
            c0,0.1,0,0.1,0.1,0.1C317.6,521.5,317.6,521.4,317.6,521.4z"/>
      </g>
        <g ref="bottom_mask" id="bottom_mask">
          <path d="M1878.3,1127.3c0,0-23.2,18.5-31.9,22.9c-2-14.6-7.6-52-7.6-52l-2.8,3.3c-0.7-5-1.2-8.3-1.2-8.3l-46.9,56.7
            c-4.6-8.1-12.5-22.2-14.3-25.9c-0.2-0.5-0.8-0.7-1.7-0.6c-1-1.9-1.9-3.5-2.3-4.4c-2.2-4.5-32.5,17.6-41.2,24l-4.5-17.8l-2.4,1.3
            l-1.6-6.3l-43.9,23.7c-5.3-13-18.1-43.5-23.8-47.6c-1.9-3-3.6-5-4.8-5.4c-6.7-2-68.3,58.7-68.3,58.7s-44.4-42.2-44.5-43.1
            c-0.1-0.9-53.8,32.3-53.8,32.3s-35.6-29-38.3-33.6c-2.4-4.2-33.9,23.1-39.5,28l-14.5-26.6l-1,0.6l-3-5.6l-61.6,38
            c-4.8-7.4-13.2-20.6-15.2-25.8c-0.2-0.6-1-0.9-2.1-0.9c-0.9-1.6-1.5-3-1.9-4.1c-2.9-7.4-68.5,32.1-78.7,33.5c-0.1,0-0.2,0-0.3,0
            c-1.9-10.6,3.6-34.9,3.3-39.3c-0.1-0.9-1.8-0.3-4.6,1.4c0.4-3,0.7-5.3,0.6-6.4c-0.5-5.8-64.2,48.5-64.2,48.5l-36.2-34.7l-59,32.9
            c0,0-22.2-20.2-23.8-24c-1.4-3.3-34.5,19.7-43.4,26l-9.6-34.8l-2.4,0.8l-1.6-5.8l-75.1,24.1c-3.8-8.4-11.2-24-15.1-28.6
            c-0.2-0.3-0.6-0.4-0.9-0.5c-1.1-1.9-2.2-3.5-3.1-4.5c-5.6-6.5-41.8,51.1-50.7,52.1c-0.8,0.1-1.6-0.2-2.4-0.9
            c-7.9-13.3-16.4-44.5-16.4-44.5l-2.1,1.5c-1.2-4-1.9-6.5-1.9-6.5l-49,35.5l-21.5-35.3l-0.7,0.3l-3.3-5.3L639,1139.9l-26.1-33.3l0,0
            l-4-5l-39.3,38.3l-35.2-43.7l-34.3,36.2l-15.5-30l-0.9,0.9l-3.1-5.9l-33.1,31.1l-29-31.1l-43.5,30.5c0,0-54.3-32-55.9-35.9
            c-1.5-3.7-54.4,39.8-61.4,45.5l-24.7-42.9l-0.9,0.4l-3.1-5.4l-99.9,41.9l-20.3-46.5l-1.4,1l-2.6-6l-66.3,46.1
            c0,0-26.1-21.2-42.2-33.6v1527.1h1912V1155.5L1878.3,1127.3z"/>
      </g>
        <g ref="bottom_display" id="bottom_display">
          <path fill="#FFFFFF" stroke="#000000" stroke-width="3" d="M1908.1,1155.5v68.8H-3.9v-131.8c16.1,12.4,42.2,33.6,42.2,33.6l66.3-46.1l22.8,52.1l101.5-42.5l27.9,48.5
            c0,0,60.5-50.1,62.1-46.1c1.6,4,55.9,35.9,55.9,35.9l43.5-30.5l29,31.1l33.1-31.1l18.6,35.9l35.2-37.1l35.2,43.7l39.3-38.3
            l30,38.3l102.5-45.5l24.9,40.7l49.7-35.9c0,0,13.9,51.4,22.8,50.3c8.9-1,45.2-58.6,50.7-52.1c5.6,6.5,17.6,34.1,17.6,34.1
            l76.6-24.6l11.4,41.3c0,0,44-31.3,45.6-27.6c1.6,3.8,23.8,24,23.8,24l59-32.9l36.2,34.7c0,0,63.7-54.4,64.2-48.5
            c0.5,5.8-9.2,45.7,1,44.3c10.2-1.4,75.8-41,78.7-33.5c2.9,7.4,18.6,31.1,18.6,31.1l62.1-38.3l17.6,32.3c0,0,37.7-33.3,40.4-28.8
            c2.7,4.6,38.3,33.6,38.3,33.6s53.7-33.3,53.8-32.3c0.1,1,44.5,43.1,44.5,43.1s61.6-60.7,68.3-58.7c6.7,2,26.9,53.9,26.9,53.9
            l45.6-24.6l6.2,24.6c0,0,41-31.1,43.5-25.8c2.5,5.3,17.6,31.8,17.6,31.8l47.6-57.5c0,0,7.8,53.1,8.3,57.5
            c0.4,4.4,35.2-23.4,35.2-23.4L1908.1,1155.5z"/>
          <path d="M1908.1,1155.5v68.8H-3.9v-131.8c16.1,12.4,46.2,38.6,46.2,38.6l66.3-46.1l22.8,52.1l101.5-42.5l27.9,48.5
            c0,0,60.5-50.1,62.1-46.1c1.6,4,55.9,35.9,55.9,35.9l43.5-30.5l29,31.1l33.1-31.1l18.6,35.9l35.2-37.1l35.2,43.7l39.3-38.3
            l30,38.3l102.5-45.5l24.9,40.7l49.7-35.9c0,0,13.9,51.4,22.8,50.3c8.9-1,45.2-58.6,50.7-52.1c5.6,6.5,17.6,34.1,17.6,34.1
            l76.6-24.6l11.4,41.3c0,0,44-31.3,45.6-27.6c1.6,3.8,23.8,24,23.8,24l59-32.9l36.2,34.7c0,0,63.7-54.4,64.2-48.5
            c0.5,5.8-9.2,45.7,1,44.3c10.2-1.4,75.8-41,78.7-33.5c2.9,7.4,18.6,31.1,18.6,31.1l62.1-38.3l17.6,32.3c0,0,37.7-33.3,40.4-28.8
            c2.7,4.6,38.3,33.6,38.3,33.6s53.7-33.3,53.8-32.3c0.1,1,44.5,43.1,44.5,43.1s61.6-60.7,68.3-58.7c6.7,2,26.9,53.9,26.9,53.9
            l45.6-24.6l6.2,24.6c0,0,41-31.1,43.5-25.8c2.5,5.3,17.6,31.8,17.6,31.8l47.6-57.5c0,0,7.8,53.1,8.3,57.5
            c0.4,4.4,35.2-23.4,35.2-23.4L1908.1,1155.5z"/>
        </g>
        <g ref="top_mask" id="top_mask">
        <path d="M-3.9-1578.1V-62.9c16.1,12.4,42.2,33.6,42.2,33.6l66.3-46.1l22.8,52.1l101.5-42.5l27.9,48.5c0,0,60.5-50.1,62.1-46.1
            c1.6,4,55.9,35.9,55.9,35.9l43.5-30.5l29,31.1l33.1-31.1l18.6,35.9l4.9-5.2l0.1,0.2l30.3-32l35.1,43.6l39.3-38.3l30,38.3
            l102.5-45.5l24.9,40.7L816-56.3c0,0,13.9,51.4,22.8,50.3c1.9-0.2,5.1-3.1,9.1-7.4c8.7-7.5,24.9-30.5,36-42.6
            c2.7-2.3,4.7-3.3,5.7-2.1C895-51.7,907.1-24,907.1-24l76.6-24.6l11.4,41.3c0,0,44-31.3,45.6-27.6c1.6,3.8,23.8,24,23.8,24l59-32.9
            L1159.7-9c0,0,63.7-54.4,64.2-48.5c0.5,5.8-9.2,45.7,1,44.3c10.2-1.4,75.8-41,78.7-33.5c2.9,7.4,18.6,31.1,18.6,31.1l62.1-38.3
            l17.6,32.3c0,0,37.7-33.3,40.4-28.8c2.7,4.6,38.3,33.6,38.3,33.6s53.7-33.3,53.8-32.3c0.1,1,44.5,43.1,44.5,43.1
            s61.6-60.7,68.3-58.7c6.7,2,26.9,53.9,26.9,53.9l45.6-24.6l6.2,24.6c0,0,41-31.1,43.5-25.8c2.5,5.3,17.6,31.7,17.6,31.7l4.7-5.6
            c0.2,0.4,0.3,0.6,0.3,0.6l42.8-51.6c1,6.9,7.7,52.6,8.2,56.6c0.1,1.2,2.9-0.1,6.8-2.5c6.3-2.2,28.4-20.8,28.4-20.8L1908.1,0
            v-1578.1H-3.9z"/>
      </g>
        <g ref="top_display" id="top_display">
          <path fill="#FFFFFF" stroke="#000000" stroke-width="3" d="M1908.1-137.8V0l-29.8-28.2c0,0-34.8,27.7-35.2,23.4c-0.4-4.4-8.3-57.5-8.3-57.5l-47.6,57.5
            c0,0-15.1-26.4-17.6-31.8c-2.5-5.3-43.5,25.8-43.5,25.8l-6.2-24.6l-45.6,24.6c0,0-20.2-51.9-26.9-53.9c-6.7-2-68.3,58.7-68.3,58.7
            s-44.4-42.2-44.5-43.1c-0.1-0.9-53.8,32.3-53.8,32.3s-35.6-29-38.3-33.6c-2.7-4.6-40.4,28.8-40.4,28.8l-17.6-32.3l-62.1,38.3
            c0,0-15.8-23.7-18.6-31.1c-2.9-7.4-68.5,32.1-78.7,33.5c-10.2,1.4-0.6-38.5-1-44.3c-0.5-5.8-64.2,48.5-64.2,48.5l-36.2-34.7
            l-59,32.9c0,0-22.2-20.2-23.8-24c-1.6-3.8-45.6,27.6-45.6,27.6l-11.4-41.3L907.1-24c0,0-12.1-27.7-17.6-34.1
            c-5.6-6.5-41.8,51.1-50.7,52.1C829.8-5,816-56.3,816-56.3l-49.7,35.9l-24.9-40.7L638.9-15.6l-30-38.3l-39.3,38.3l-35.2-43.7
            l-35.2,37.1l-18.6-35.9L447.4-27l-29-31.1l-43.5,30.5c0,0-54.3-32-55.9-35.9c-1.6-4-62.1,46.1-62.1,46.1l-27.9-48.5L127.4-23.4
            l-22.8-52.1L38.4-29.4c0,0-26.1-21.2-42.2-33.6v-74.9H1908.1z"/>
          <path d="M1908.1-137.8V0l-29.8-28.2c0,0-29.6,24.9-30,20.6c-0.4-4.4-8.5-59.7-8.5-59.7l-47.6,57.5c0,0-15.1-26.4-17.6-31.8
            c-2.5-5.3-43.5,25.8-43.5,25.8l-6.2-24.6l-45.6,24.6c0,0-20.2-51.9-26.9-53.9c-6.7-2-68.3,58.7-68.3,58.7s-44.4-42.2-44.5-43.1
            c-0.1-0.9-53.8,32.3-53.8,32.3s-35.6-29-38.3-33.6c-2.7-4.6-40.4,28.8-40.4,28.8l-17.6-32.3l-62.1,38.3c0,0-15.8-23.7-18.6-31.1
            c-2.9-7.4-68.5,32.1-78.7,33.5c-10.2,1.4-0.6-38.5-1-44.3c-0.5-5.8-64.2,48.5-64.2,48.5l-36.2-34.7l-59,32.9
            c0,0-22.2-20.2-23.8-24c-1.6-3.8-45.6,27.6-45.6,27.6l-11.4-41.3L912.1-29c0,0-12.1-27.7-17.6-34.1c-5.6-6.5-41.8,51.1-50.7,52.1
            c-8.9,1-22.8-50.3-22.8-50.3l-49.7,35.9l-24.9-40.7L643.9-20.6l-30-38.3l-39.3,38.3l-35.2-43.7l-35.2,37.1l-18.6-35.9L452.4-32
            l-29-31.1l-43.5,30.5c0,0-54.3-32-55.9-35.9c-1.6-4-62.1,46.1-62.1,46.1l-27.9-48.5L132.4-28.4l-22.8-52.1L38.4-29.4
            c0,0-26.1-21.2-42.2-33.6v-74.9H1908.1z"/>
        </g>
      </g>
    </svg>
    <div class="preloader_lineMask" ref="lineMask"></div>

    <div ref="gifContainer">
      <div class="preloader_gif_wrapper">
        <img v-if="mascotte > 0" :src="`/image/gifs/${mascotte}.gif`" alt="mascotte" class="preloader_gif">
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import ResourceLoader from '@/webgl/vendor/resource-loader/ResourceLoader'
import ThreeTextureLoader from '@/webgl/vendor/loaders/three-texture-loader'
import ThreeVideoLoader from '@/webgl/vendor/loaders/three-video-loader'

import resources from '@/config/resources'
import { supabase } from '@/utils/supabase'
import * as siteContent from '@/content/site'
import { gsap } from '@/vendor/gsap'
import { randomInt } from '@/utils/random'

export default {
  name: 'Preloader',
  data () {
    return {
      activeGif: 0,
      hideLoader: false,
      mascotte: 0
    }
  },
  computed: {
    ...mapGetters({
      isLoadingCompleted: 'preloader/isLoadingCompleted',
      data: 'data/getData',
      isMobile: 'layout/isMobile'
    })
  },
  beforeMount () {
    const len = require.context('../../static/image/gifs/', true, /\.(gif)$/).keys().length
    const key = randomInt(1, len)

    this.mascotte = key
  },
  async mounted () {
    await this.loadData()

    gsap.to(this.$refs.lineMask, { width: 0, duration: 0.7, onComplete: _ => {
      this.registerLoaders()
      this.setupResourceLoader()
      this.setupEventListeners()
      this.loadResources()
    }})
  },
  beforeDestroy () {
    this.removeEventListeners()
  },
  methods: {
    ...mapActions({
      setData: 'data/setData',
      setLoadingCompleted: 'preloader/setLoadingCompleted',
      setCompleted: 'preloader/setCompleted'
    }),
    async loadData() {
      const [
        { data: projectsData, count },
        { data: heroProjectsData },
        { data: categoriesData }
      ] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact' }).eq('published', true).order('order_index', { ascending: false }).limit(5),
        supabase.from('projects').select('*').eq('is_hero', true).eq('published', true).order('hero_order', { ascending: true }),
        supabase.from('categories').select('*').order('order_index', { ascending: true })
      ])

      const categories = (categoriesData || []).reduce((acc, c) => ({ ...acc, [c.id]: c }), {})
      const heroProjects = (heroProjectsData || []).reduce((acc, p) => ({ ...acc, [p.id]: { ...p, sliderTitle: p.hero_title || p.title } }), {})
      const totalPages = Math.ceil((count || 0) / 5)

      await this.setData({
        homepage: siteContent.homepage,
        heroProjects,
        projects: projectsData || [],
        pagination: { page: 1, total_pages: totalPages },
        categories,
        footer: siteContent.footer,
        aboutpage: siteContent.aboutpage,
        legalsPage: siteContent.legalsPage,
        cookiesPage: siteContent.cookiesPage,
        projectsPage: siteContent.projectsPage
      })
    },
    registerLoaders () {
      ResourceLoader.registerLoader(ThreeTextureLoader, 'texture')
      ResourceLoader.registerLoader(ThreeVideoLoader, 'video')
    },
    setupResourceLoader () {
      this.resourceLoader = new ResourceLoader()

      const allResources = [...resources, ...this.getResources()]

      this.resourceLoader.add({
        resources: allResources,
        preload: true
      })
    },
    getResources() {
      const { projects, heroProjects} = this.data

      const sources = []
      const mixProjects = { ...(Array.isArray(projects) ? { ...projects } : projects), ...heroProjects }
      const ids = []

      Object.keys(mixProjects).forEach(p => {
        const project = mixProjects[p]

        if (project.preview_video && ids.indexOf(project.id) < 0 && !this.isMobile) {
          sources.push({
            name: `${project.id}_preview_video`,
            type: 'video',
            path: project.preview_video
          })
        }

        // Priorité : video_home (MP4 direct) > poster (image HD) > thumbnail_url (Vimeo)
        if (project.video_home && ids.indexOf(project.id) < 0 && !this.isMobile) {
          sources.push({
            name: `${project.id}_hero`,
            type: 'video',
            path: `${project.video_home}?id=${p}`
          })
        }

        if (ids.indexOf(project.id) < 0) {
          if (project.video_home_mobile && this.isMobile) {
            sources.push({
              name: `${project.id}_hero_mobile`,
              type: 'video',
              path: `${project.video_home_mobile}?id=${p}`
            })
          } else if (!project.video_home) {
            const imgUrl = project.poster || project.thumbnail_url
            if (imgUrl) {
              sources.push({ name: `${project.id}_hero`, type: 'texture', path: imgUrl })
              sources.push({ name: `${project.id}_hero_mobile`, type: 'texture', path: imgUrl })
            }
          }
        }

        ids.push(project.id)
      })

      return sources
    },
    loadResources () {
      this.resourceLoader.preload()
    },
    setupEventListeners () {
      this.resourceLoader.addEventListener('complete', this.loadResourcesCompleteHandler)
    },
    removeEventListeners () {
      this.resourceLoader.removeEventListener('complete', this.loadResourcesCompleteHandler)
    },
    loadResourcesCompleteHandler () {
      this.setLoadingCompleted()

      const ratio = {
        x: 1900,
        y: 1080
      }

      const {
        line,
        bottom_mask,
        bottom_display,
        top_mask,
        top_display,
        bg,
        gifContainer
      } = this.$refs

      const topRect = top_display.getBoundingClientRect()
      const bottomRect = bottom_display.getBoundingClientRect()

      gsap.set(line, { opacity: 0})
      gsap.set([top_mask, top_display], { y: (ratio.y / 2) + (((topRect.height) * (ratio.y / window.innerHeight)) / 2)})
      gsap.set([bottom_mask, bottom_display], { y: -((ratio.y / 2) + (((bottomRect.height) * (ratio.y / window.innerHeight)) / 2))})
      gsap.set([bg, gifContainer], { opacity: 0 })
      gsap.to([top_mask, top_display, bottom_mask, bottom_display], { y: 0, duration: 0.55, ease: "linear", onComplete: _ => {
        this.hideLoader = true
        clearInterval(this.interval)
      }})
    }
  }
}
</script>

<style src="./style.sass" lang="sass" scoped></style>
