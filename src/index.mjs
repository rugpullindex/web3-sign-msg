// @format
import detectEthereumProvider from "@metamask/detect-provider";
import { html, renderer } from "@ficusjs/renderers/dist/htm";
import { createComponent, createAppState, withStore } from "ficusjs";

const store = createAppState("web3.sign", {
  initialState: {
    account: null,
    signature: null,
    web3: {
      provider: null
    }
  },
  setAccount(val) {
    this.state.account = val;
  },
  setSignature(val) {
    this.state.signature = val;
  }
});

createComponent(
  "web3-connect-metamask",
  withStore(store, {
    renderer,
    async handleConnect() {
      const provider = await getProvider();
      const account = await connectAccount(provider);
      this.store.setAccount(account);
      console.info(`Account connected: ${account}`);
    },
    render() {
      return html`
			<button type="button" onclick=${this.handleConnect}>Connect Wallet</button>
  `;
    }
  })
);

createComponent(
  "web3-sign-button",
  withStore(store, {
    renderer,
    props: {
      message: {
        type: String,
        required: true
      }
    },
    async handleSign() {
      const { message } = this.props;
      const { account } = this.store.state;
      const provider = await getProvider();
      const signature = await sign(provider, account, message);
      this.store.setSignature(signature);
    },
    render() {
      return html`
			<button type="button" onclick=${this.handleSign}>Sign</button>
  `;
    }
  })
);

createComponent(
  "web3-sign-msg",
  withStore(store, {
    renderer,
    props: {
      message: {
        type: String,
        required: true
      }
    },
    render() {
      const { account, signature } = this.store.state;
      const { message } = this.props;
      return html`
			<div>
				<p>Message: ${message}</p>
				<p>Signature: ${signature}</p>
				${account ? "" : html`<web3-connect-metamask><//>`}
				${account ? html`<web3-sign-button message=${message}><//>` : ""}
			</div>
  `;
    }
  })
);

async function getProvider() {
  return await detectEthereumProvider();
}

async function connectAccount(provider) {
  if (provider) {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    return accounts[0];
  } else {
    // TODO: Make this throw
    window.alert("Only works with Metamask");
  }
}

async function sign(provider, from, msg) {
  return new Promise((resolve, reject) => {
    provider.sendAsync(
      {
        method: "personal_sign",
        params: [msg, from],
        from
      },
      function(err, result) {
        if (err) {
          reject(err);
        }
        resolve(result.result.substring(2));
      }
    );
  });
}
