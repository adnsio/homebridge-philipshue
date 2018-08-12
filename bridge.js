const huejay = require('huejay')

const Light = require('./light')
const Statics = require('./statics')

class Bridge {
  constructor(id, log, api) {
    this.id = id
    this.log = log
    this.api = api
    this.lights = {}
    this.client = new huejay.Client()
    this.cachedAccessories = {}
  }

  addCachedAccessory(id, accessory) {
    this.cachedAccessories[id] = accessory
  }

  getCachedAccessory(id) {
    return this.cachedAccessories[id]
  }

  setHost(host) {
    this.client.host = host
  }

  setUsername(username) {
    this.client.username = username
  }
  
  getLight(id) {
    return this.lights[id]
  }

  setLight(id, light) {
    this.lights[id] = light
  }

  getOrCreateLight(id) {
    let light = this.getLight(id)
    if (!light) {
      light = new Light(id, this, this.log, this.api)
      this.setLight(id, light)
    }
    return light
  }

  async init() {
    const bridgeLights = await this.client.lights.getAll()
    const generatedAccessories = []
    for (const bridgeLight of bridgeLights) {
      const light = this.getOrCreateLight(bridgeLight.id)
      const cachedAccessory = this.getCachedAccessory(bridgeLight.id)
      light.setBridgeLight(bridgeLight)
      if (cachedAccessory) {
        light.setAccessory(cachedAccessory)
        this.log(`Loaded bridge ${this.id} light ${bridgeLight.id} from cache`)
      } else {
        const accessory = light.generateAccessory(bridgeLight)
        light.setAccessory(accessory)
        generatedAccessories.push(accessory)
        this.log(`Loaded bridge ${this.id} light ${bridgeLight.id}`)
      }
    }
    this.api.registerPlatformAccessories(Statics.PlatformId, Statics.PlatformName, generatedAccessories)
    this.updateLightsTimeout()
  }

  updateLightsTimeout() {
    const self = this
    setTimeout(function() { self.updateLights() }, 5000)
  }

  async updateLights() {
    this.log(`Updating bridge ${this.id} lights...`)
    const bridgeLights = await this.client.lights.getAll()
    for (const bridgeLight of bridgeLights) {
      const light = this.getLight(bridgeLight.id)
      if (light) {
        light.setBridgeLight(bridgeLight)
      }
    }
    this.updateLightsTimeout()
  }
}

module.exports = Bridge
