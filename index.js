const huejay = require('huejay')

const Bridge = require('./bridge')
const Statics = require('./statics')

class PhilipsHue {
  constructor(log, config, api) {
    this.log = log
    this.config = config
    this.api = api
    this.bridges = {}
    this.init()
  }

  configureAccessory(accessory) {
    this.log(`Configuring accessory ${accessory.UUID}...`)
    if (accessory.context.bridgeId && accessory.context.type) {
      const bridge = this.getOrCreateBridge(accessory.context.bridgeId)
      bridge.addCachedAccessory(accessory.displayName, accessory)
    }
  }

  async init() {
    const discoveredBridges = await huejay.discover()
    for (const discoveredBridge of discoveredBridges) {
      this.log(`Discovered bridge ${discoveredBridge.id} with ip ${discoveredBridge.ip}`)
      const bridge = this.getOrCreateBridge(discoveredBridge.id)
      bridge.setHost(discoveredBridge.ip)
      const bridgeConfig = this.getBridgeConfig(discoveredBridge.id)
      if (bridgeConfig && bridgeConfig.username) {
        bridge.setUsername(bridgeConfig.username)
      } else {

      }
      await bridge.init()
      this.log(`Bridge ${discoveredBridge.id} is ready`)
    }
  }

  getBridge(id) {
    return this.bridges[id]
  }

  setBridge(id, bridge) {
    this.bridges[id] = bridge
  }

  getOrCreateBridge(id) {
    let bridge = this.getBridge(id)
    if (!bridge) {
      bridge = new Bridge(id, this.log, this.api)
      this.setBridge(id, bridge)
    }
    return bridge
  }

  getBridgeConfig(id) {
    if (!this.config.bridges) return undefined
    return this.config.bridges[id]
  }
}

module.exports = function(homebridge) {
  Statics.Accessory = homebridge.platformAccessory
  Statics.Service = homebridge.hap.Service
  Statics.Characteristic = homebridge.hap.Characteristic
  Statics.UUIDGen = homebridge.hap.uuid
  Statics.PlatformName = 'PhilipsHue'
  Statics.PlatformId = 'homebridge-philipshue'
  homebridge.registerPlatform(Statics.PlatformId, Statics.PlatformName , PhilipsHue, true)
}
