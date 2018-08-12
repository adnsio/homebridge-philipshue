const Statics = require('./statics')

class Light {
  constructor(id, bridge, log, api) {
    this.id = id
    this.bridge = bridge
    this.log = log
    this.api = api
    this.accessory = undefined
    this.bridgeLight = undefined
  }
  
  setAccessory(accessory) {
    this.accessory = accessory
    this.setAccessoryEvents()
  }

  setAccessoryEvents() {
    const self = this
    const service = this.accessory.getService(Statics.Service.Lightbulb)
    service.getCharacteristic(Statics.Characteristic.On)
      .on('set', async function(value, callback) {
        self.log(`Setting bridge ${self.bridge.id} light ${self.id} on = ${value}`)
        if (self.bridgeLight.on != value) {
          self.bridgeLight.on = value
          self.bridgeLight = await self.bridge.client.lights.save(self.bridgeLight)
        }
        callback()
      })
      .on('get', function(callback) {
        self.log(`Getting bridge ${self.bridge.id} light ${self.id} on`)
        callback(undefined, self.bridgeLight.on)
      })
    service.getCharacteristic(Statics.Characteristic.Brightness)
      .on('set', async function(value, callback) {
        self.log(`Setting bridge ${self.bridge.id} light ${self.id} brightness = ${value}`)
        value = parseInt(value * (254 / 100))
        if (self.bridgeLight.on && self.bridgeLight.brightness != value) {
          self.bridgeLight.on = true
          self.bridgeLight.brightness = value
          self.bridgeLight = await self.bridge.client.lights.save(self.bridgeLight)
        }
        callback()
      })
      .on('get', function(callback) {
        self.log(`Getting bridge ${self.bridge.id} light ${self.id} brightness`)
        callback(undefined, self.bridgeLight.brightness * (100 / 254))
      })
    
    this.log(this.bridgeLight.type)
    if (this.bridgeLight.type === 'Extended color light') {
      service.getCharacteristic(Statics.Characteristic.Hue)
        .on('set', async function(value, callback) {
          self.log(`Setting bridge ${self.bridge.id} light ${self.id} hue = ${value}`)
          // value = parseInt(value * (254 / 100))
          // if (self.bridgeLight.on && self.bridgeLight.brightness != value) {
          //   self.bridgeLight.on = true
          //   self.bridgeLight.brightness = value
          //   self.bridgeLight = await self.bridge.client.lights.save(self.bridgeLight)
          // }
          callback()
        })
        // .on('get', function(callback) {
        //   self.log(`Getting bridge ${self.bridge.id} light ${self.id} hue`)
        //   callback(undefined, self.bridgeLight.hue)
        // })
      service.getCharacteristic(Statics.Characteristic.Saturation)
        .on('set', async function(value, callback) {
          self.log(`Setting bridge ${self.bridge.id} light ${self.id} saturation = ${value}`)
          // value = parseInt(value * (254 / 100))
          // if (self.bridgeLight.on && self.bridgeLight.brightness != value) {
          //   self.bridgeLight.on = true
          //   self.bridgeLight.brightness = value
          //   self.bridgeLight = await self.bridge.client.lights.save(self.bridgeLight)
          // }
          callback()
        })
        // .on('get', function(callback) {
        //   self.log(`Getting bridge ${self.bridge.id} light ${self.id} saturation`)
        //   callback(undefined, self.bridgeLight.saturation)
        // })
    }
    
    this.updateAccessory()
  }

  setBridgeLight(bridgeLight) {
    this.bridgeLight = bridgeLight
    this.updateAccessory()
  }

  updateAccessory() {
    if (this.accessory) {
      const service = this.accessory.getService(Statics.Service.Lightbulb)
      service.updateCharacteristic(Statics.Characteristic.On, this.bridgeLight.on)
      service.updateCharacteristic(Statics.Characteristic.Brightness, this.bridgeLight.brightness * (100 / 254))
    }
  }

  generateAccessory(light) {
    const accessory = new Statics.Accessory(light.id, Statics.UUIDGen.generate(light.id))
    accessory.context.bridgeId = this.bridge.id
    accessory.context.type = 'light'
    accessory.addService(Statics.Service.Lightbulb, light.name)
    accessory.getService(Statics.Service.AccessoryInformation)
      .setCharacteristic(Statics.Characteristic.Manufacturer, light.manufacturer)
      .setCharacteristic(Statics.Characteristic.Model, light.model.name)
      .setCharacteristic(Statics.Characteristic.SerialNumber, light.modelId)
    return accessory
  }
}

module.exports = Light
