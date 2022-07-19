import Vue from 'vue'
import { Prop, Component, Ref, Model, Provide, Inject } from 'vue-property-decorator'

const symbol = Symbol('baz')

/**
 * My basic tag
 */
@Component({
  name: 'oao',
  props: ['bar', 'qaq', 'cac'],
  data () {
    const a = 'pa';
    return {
      a: a
    }
  }
})
export default class BasicPropertyClass extends Vue {
  theString = "ciao"
  willHaveAValue: null | string = null
  obj: IBigObject = {}
  @Watch("theString") onStringChange () {
    console.log(this.theString)
  }
  mounted() {
    this.$translate("label_ciao")
    this.$isSmall()
    this.$router.push()
  }
}