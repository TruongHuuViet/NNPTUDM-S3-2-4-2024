router.post("/forgotPassword", userValidator.checkmail(), async function (req, res, next) {
    const resultvalidate = validationResult(req);
    if (resultvalidate.errors.length > 0) {
      ResHelper.RenderRes(res, false, resultvalidate.errors);
      return;
    }
    var user = await userModel.findOne({
      email: req.body.email
    })
    if (user) {
      let token = user.genTokenResetPassword();
      await user.save()
      try {
        let url = `http://${config.hostName}/api/v1/auth/ResetPassword/${token}`;
        let message = `click zo url de reset passs: ${url}`
        console.log(user.email);
        sendmail(message, user.email)
        ResHelper.RenderRes(res, true, "Thành Công");
      } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExp = undefined;
        await user.save();
        ResHelper.RenderRes(res, false, error);
      }
    } else {
      ResHelper.RenderRes(res, false, "Email Không Tồn Tại");
    }
  
  })
  
router.post("/ResetPassword/:token", userValidator.checkPass(),async function (req, res, next) {
    const resultvalidate = validationResult(req);
    console.log(resultvalidate);
    if (resultvalidate.errors.length > 0) {
      ResHelper.RenderRes(res, false, resultvalidate.errors);
      return;
    }
    var user = await userModel.findOne({
      resetPasswordToken: req.params.token
    })
    if (user) {
      if (user.resetPasswordExp > Date.now()) {
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExp = undefined;
        await user.save();
        ResHelper.RenderRes(res, true, "Reset Thành Công");
      } else {
        ResHelper.RenderRes(res, false, "URL Hết Hạn");
      }
    } else {
      ResHelper.RenderRes(res, false, "URL Không Hợp Lệ");
    }
  
  });
  
  router.post('/ChangePassword', checkLogin, userValidator.checkPass(), async function (req, res, next) {
    const resultvalidate = validationResult(req);
    console.log(resultvalidate);
    if (resultvalidate.errors.length > 0) {
        ResHelper.RenderRes(res, false, resultvalidate.errors);
        return;
    }
    if (req.cookies.token) {
        const userinfo = req.user;
        let user = await userModel.findById(userinfo._id);
        if (user) {
            user.password = req.body.password
            await user.save();
            ResHelper.RenderRes(res, true, "Thay Đổi Password Thành Công");
        }
    } else {
        ResHelper.RenderRes(res, false, "URL Không Hợp Lệ");
    }
});
