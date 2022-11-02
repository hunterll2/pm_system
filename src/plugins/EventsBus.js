import Vue from 'Vue'

const eventBus = {}

eventBus.install = (Vue) => {
    Vue.prototype.$bus = new Vue()
}

// Vue.use(eventBus)

export default eventBus