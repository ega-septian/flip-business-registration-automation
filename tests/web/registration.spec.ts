import { test, expect } from "@playwright/test";
import { SignupPage, SignupError } from "@pages/SignupPage.js";
import { buildIndividualSignup, buildCompanySignup } from "@data/users.js";

test.describe("Flip for Business — Registration", () => {
  let signup: SignupPage;

  test.beforeEach(async ({ page }) => {
    signup = new SignupPage(page);
    await signup.goto();
  });

  test("Register a new individual business (Perseorangan) with valid data",
    { tag: ["@smoke", "@registration"] },
    async ({ page }) => {
      // Step 1: Open the signup page and fill every field.
      const data = buildIndividualSignup();
      await signup.fillForm(data);

      // Step 2: The "Buat Akun" button is enabled once the form is complete.
      await expect(signup.submitButton).toBeEnabled();

      // Step 3: Click submit the form.
      await signup.submit();

      // Step 4: The account is created and the "email verification sent" screen is shown for the registered email.
      await expect(page).toHaveURL(/\/verification\/email/, { timeout: 15_000 });
      await expect(
        page.getByTestId("qa-email-verification-title"),
      ).toHaveText("Email verifikasi terkirim!", { timeout: 15_000 });
      await expect(
        page.getByTestId("qa-email-verification-user-email"),
      ).toHaveText(data.email, { timeout: 15_000 });
    },
  );

  test("Register a new legal-entity business (Badan Usaha) with valid data",
    { tag: ["@smoke", "@registration"] },
    async ({ page }) => {
      // Step 1: Open the signup page and fill every field with valid legal-entity data, including "Nama Bisnis".
      const data = buildCompanySignup();
      await signup.fillForm(data);

      // Step 2: The "Buat Akun" button is enabled once the form is complete.
      await expect(signup.submitButton).toBeEnabled();

      // Step 3: Click submit the form.
      await signup.submit();

      // Step 4: The account is created and the "email verification sent" screen is shown for the registered email.
      await expect(page).toHaveURL(/\/verification\/email/, { timeout: 15_000 });
      await expect(
        page.getByTestId("qa-email-verification-title"),
      ).toHaveText("Email verifikasi terkirim!", { timeout: 15_000 });
      await expect(
        page.getByTestId("qa-email-verification-user-email"),
      ).toHaveText(data.email, { timeout: 15_000 });
    },
  );

  test("Show an inline error when the email address format is invalid",
    { tag: ["@regression", "@registration"] },
    async ({ page }) => {
      // Step 1: Enter a value that is not a valid email address in the "Email" field.
      await signup.emailInput.fill("bukan-email");

      // Step 2: Move focus away from the "Email" field.
      await signup.fullNameInput.click();

      // Step 3: The inline error "Format email salah" is shown.
      await expect(page.getByText(SignupError.emailFormat)).toBeVisible();
    },
  );

  test('Keep the "Buat Akun" button disabled until every required field is filled',
    { tag: ["@regression", "@registration"] },
    async () => {
      const data = buildIndividualSignup();

      // Step 1: On the freshly opened signup page, the "Buat Akun" button is disabled.
      await expect(signup.submitButton).toBeDisabled();

      // Step 2: Fill name, email, phone and select "Perseorangan", but leave "Buat ID Flip for Business" empty.
      await signup.fullNameInput.fill(data.fullName);
      await signup.emailInput.fill(data.email);
      await signup.phoneInput.fill(data.phone);
      await signup.selectBusinessType("Perseorangan");
      await signup.passwordInput.fill(data.password);

      // Step 3: The "Buat Akun" button is still disabled while a required field is empty.
      await expect(signup.submitButton).toBeDisabled();

      // Step 4: Fill "Buat ID Flip for Business" then the button becomes enabled.
      await signup.businessIdInput.fill(data.businessId);
      await expect(signup.submitButton).toBeEnabled();
    },
  );

  test("Show the Buat ID Flip for Business field and ID suggestions after selecting Perseorangan",
    { tag: ["@regression", "@registration"] },
    async () => {
      // Step 1: Fill Nama Lengkap, Email and Nomor HP so the "Tipe Bisnis" selector is enabled.
      await signup.fillIdentity(buildIndividualSignup());

      // Step 2: Select the "Perseorangan" business type.
      await signup.selectBusinessType("Perseorangan");

      // Step 3: The "Buat ID Flip for Business" field is shown with at least one suggested ID.
      await expect(signup.businessIdInput).toBeVisible();
      await expect(signup.businessIdSuggestions.first()).toBeVisible();
      expect(await signup.businessIdSuggestions.count()).toBeGreaterThan(0);
    },
  );

  test("Show the Nama Bisnis and Buat ID Flip for Business fields after selecting Badan Usaha",
    { tag: ["@regression", "@registration"] },
    async () => {
      // Step 1: Fill Nama Lengkap, Email and Nomor HP so the "Tipe Bisnis" selector is enabled.
      await signup.fillIdentity(buildCompanySignup());

      // Step 2: Select the "Badan Usaha" business type.
      await signup.selectBusinessType("Badan Usaha");

      // Step 3: Both the "Nama Bisnis" and "Buat ID Flip for Business" fields are shown.
      await expect(signup.businessNameInput).toBeVisible();
      await expect(signup.businessIdInput).toBeVisible();
    },
  );

  test("Reject a password shorter than 8 characters with an inline error",
    { tag: ["@regression", "@registration"] },
    async ({ page }) => {
      // Step 1: Fill the form with otherwise valid data but a 5-character password.
      await signup.fillForm(buildIndividualSignup({ password: "short" }));

      // Step 2: Submit the form.
      await signup.submit();

      // Step 3: The inline error "Kata sandi minimal 8 karakter" is shown.
      await expect(page.getByText(SignupError.passwordTooShort)).toBeVisible();
    },
  );

  test("Reject a weak 8-plus character password on submit",
    { tag: ["@regression", "@registration"] },
    async ({ page }) => {
      // Step 1: Fill the form with otherwise valid data but a weak 8-character password.
      await signup.fillForm(buildIndividualSignup({ password: "abcdefgh" }));

      // Step 2: Submit the form.
      await signup.submit();

      // Step 3: The error "Kata sandi terlalu lemah ..." is shown and the signup screen is not left.
      await expect(page.getByText(SignupError.passwordTooWeak)).toBeVisible({
        timeout: 15_000,
      });
      await expect(page).toHaveURL(/\/signup$/);
    },
  );

  test("Reject a Buat ID Flip for Business that contains a space",
    { tag: ["@regression", "@registration"] },
    async ({ page }) => {
      // Step 1: Fill the form with otherwise valid data but a business ID that contains a space.
      await signup.fillForm(buildIndividualSignup({ businessId: "budi qa" }));

      // Step 2: Submit the form.
      await signup.submit();

      // Step 3: The inline error about the allowed character set is shown.
      await expect(page.getByText(SignupError.businessIdCharset)).toBeVisible();
    },
  );
});
