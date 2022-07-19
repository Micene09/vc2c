import { Vue, Component, Watch } from 'vue-property-decorator'

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
  obj: IBigObject | null = null
  obj2: { test: number } = { test: 1 }
  obj3: Partial<{ test: number }> = {}
  mounted() {
    this.$translate("label_ciao")
    this.$isSmall()
    this.$router.push()
  }
  @Watch("theString") onStringChange () {
    console.log(this.theString)
  }
}