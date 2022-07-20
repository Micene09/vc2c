import { Vue, Component, Watch, Prop } from 'vue-property-decorator'

@Component({
  name: 'basic-component',
  components: {
    Comp1,
    Comp2
  },
  directives: {
    date,
    time
  }
})
export default class BasicComponent extends Vue {
  @Prop({ type: String, default: "" }) value
  @Prop({ type: Array, default: () => [] }) firstProp
  theString = "ciao"
  willHaveAValue: null | string = null
  obj: IBigObject | null = null
  obj2: { test: number } = { test: 1 }
  obj3: Partial<{ test: number }> = {}
  mounted() {
    this.$translate("label_ciao")
    this.$isSmall()
    this.$router.push()
    this.$emit("asd")
  }
  @Watch("theString") onStringChange () {
    console.log(this.theString)
  }
}