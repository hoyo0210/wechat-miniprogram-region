const app = getApp()

Component({
  properties: {
    deep: {
      type: Number,
      value: 3
    },
    adcode: {
      type: String,
      value: '100000'
    }
  },
  data: {
    regions: [],
    value: [],
    region: '',
    isCanConfirm: false,
    selectedIndex: []
  },
  methods: {
    pickAddress() {
      if (!this.data.regions.length) {
        this.getRegions(this.data.deep, this.data.adcode)
      }
      this.setData({
        visible: true
      })
    },
    getRegions: function (deep, adcode) {
      wx.request({
        url: 'https://restapi.amap.com/v3/config/district?key=37211626d271e2bcf86d96759cdddf93&subdistrict=' + deep + '&keywords=' + adcode,
        success: res => {
          const root = res.data['districts'].pop()
          let regions = this.data.regions
          this.split(this.convert(root['districts']))
          this.setData({
            regions: regions
          })
        }
      })
    },
    convert: function (districts) {
      const regions = []
      if (districts.length === 0) {
        return null
      }
      districts.map(district => {
        regions.push({
          label: district['name'],
          adCode: district['adcode'],
          children: this.convert(district['districts'])
        })
      })
      return regions
    },
    split: function (districts) {
      let regions = this.data.regions
      let selectedIndex = this.data.selectedIndex
      regions.push(districts)
      selectedIndex.push(0)
      this.setData({
        regions: regions,
        selectedIndex: selectedIndex
      })
      if (districts[0].children) {
        this.split(districts[0].children)
      }
    },
    cityChange: function (e) {
      const selectedIndex = e.detail.value
      const regions = this.data.regions
      selectedIndex.map((value, index) => {
        value = regions[index].length <= value ? 0 : value
        if (regions[index][value].children) {
          regions[index + 1] = regions[index][value].children
        }
        selectedIndex[index] = value
      })
      this.setData({
        selectedIndex: selectedIndex,
        regions: regions
      })
    },
    chooseStart(e) {
      this.setData({
        isCanConfirm: false
      })
    },
    chooseEnd(e) {
      this.setData({
        isCanConfirm: true
      })
    },
    cityCancel: function (e) {
      this.setData({
        visible: false
      })
    },
    citySure: function (e) {
      const region = []
      const selectedIndex = this.data.selectedIndex
      const regions = this.data.regions
      selectedIndex.map((value, index) => {
        region.push(regions[index][value].label)
      })
      this.setData({
        region: region,
        visible: false
      })
      this.triggerEvent('change', region)
    }
  }
})