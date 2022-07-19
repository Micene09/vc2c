import setup from "./setup"
import code from "./code?raw"

setup(code, {
  instancePluginConverter: {
	$translate: { composable: "translate", importsFrom: "@app-my-sticazzi", isPureFunction: true },
	$isSmall: { composable: "useResponsive", importsFrom: "@app-my-sticazzi", mapToInternalFunction: "isSmall" },
	$router: { composable: "useRouter", importsFrom: "@app-my-sticazzi" }
  }
})