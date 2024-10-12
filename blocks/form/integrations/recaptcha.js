export default class GoogleReCaptcha {
  id;
  name;
  config;
  formName;
  loadPromise;

  constructor(siteKey, id) {
    this.config = config;
    this.name = name;
    this.id = id;
    this.formName = formName;
  }

  #loadScript(url) {
    if (!this.loadPromise) {
      this.loadPromise = new Promise((resolve, reject) => {
        const head = document.head || document.querySelector('head');
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.onload = () => resolve(window.grecaptcha);
        script.onerror = () => reject(new Error(`Failed to load script ${url}`));
        head.append(script);
      });
    }
  }

  loadCaptcha(form) {
    if (form && this.config.siteKey) {
      const submit = form.querySelector('button[type="submit"]');
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const siteKey = this.config.siteKey;
            const url = this.config.uri ;
            if(this.config.version == 'enterprise')
              this.#loadScript(url+'?render=' + siteKey);
            else
            this.#loadScript(`https://www.google.com/recaptcha/api.js?render=${siteKey}`);
            obs.disconnect();
          }
        });
      });
      if(submit==null){
        console.error('Submit button is not defined');
        alert('Submit button is not defined: To load CAPTCHA please add a submit button to the form.');
      }
      else
      obs.observe(submit);
    }
    else{
      console.warn('Form or siteKey is not defined');
      alert('Can not load captcha. Form or siteKey is not defined');
    }
  }

  async getToken() {
    if (!this.siteKey) {
      return null;
    }
    return new Promise((resolve) => {
      const { grecaptcha } = window;
      if(this.config.version == 'enterprise'){
        grecaptcha.enterprise.ready(async () => {
          const submit_action = 'submit_'+this.formName+"_"+this.name;
          const token = await grecaptcha.enterprise.execute(this.config.siteKey, {action: submit_action});
          resolve(token);
        });
      }
      else{
        grecaptcha.ready(async () => {
          const token = await grecaptcha.execute(this.siteKey, { action: 'submit' });
          resolve(token);
        });
      }
    });
  }
}
