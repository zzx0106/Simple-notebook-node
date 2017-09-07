import fetch from "node-fetch";
import formidable from "formidable";
import path from "path";
import fs from "fs";
import NumbersModel from "../models/NumbersModel";
export default class BaseComponent {
  constructor() {
    this.numberList = [
      "user_number",
      "user_login_number",
      "not_number",
      "admin_number",
      "admin_login_number",
    ];
    this.imgTypeList = ["shop", "food", "avatar", "default"];
    // this.uploadImg = this.uploadImg.bind(this);
    // this.qiniu = this.qiniu.bind(this);
  }
  async fetch(url = "", data = {}, type = "GET", resType = "JSON") {
    type = type.toUpperCase();
    resType = resType.toUpperCase();
    let requestConfig = {
      method: type,
      headers: {
        Accept: "application/json, text/javascript, */*",
        "Content-Type": "application/json;charset=utf-8"
      }
    };
    if (type === "GET") {
      let dataStr = ""; //数据拼接
      Object.keys(data).forEach(key => {
        dataStr += `${key}=${data[key]}&`;
      });
      if (dataStr !== "") {
        dataStr = dataStr.substr(0, dataStr.lastIndexOf("&"));
        url = `${url}?${dataStr}`;
      }
    }
    if (type === "POST") {
      Object.defineProperty(requestConfig, "body", {
        value: JSON.stringify(data)
      });
    }
    let responseJson;
    try {
      const response = await fetch(url, requestConfig);
      if (resType === "TEXT") {
        responseJson = await response.text();
      } else {
        responseJson = await response.json();
      }
    } catch (err) {
      console.log("获取HTTP数据失败", err);
      throw new Error(err);
    }
    return responseJson;
  }
  //获取id列表
  async getNumbers(type) {
    if (!this.numberList.includes(type)) {
      console.log("number类型错误");
      throw new Error("number类型错误");
      return;
    }
    try {
      const numberData = await NumbersModel.findOne();
      numberData[type]++;
      await numberData.save();
      return numberData[type];
    } catch (err) {
      console.log("获取Number数据失败");
      throw new Error(err);
    }
  }
}
