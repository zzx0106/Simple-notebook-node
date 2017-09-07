"use strict";
import NoteModel from "../../models/nots/NoteModel";
import BaseComponents from "../../prototype/baseComponents";
import formidable from "formidable";
import crypto from "crypto";
import timeformate from "time-formater";
import mongoose from "mongoose";
class CTL_Note extends BaseComponents {
  constructor() {
    super();
    this.getNotes = this.getNotes.bind(this);
    this.addNote = this.addNote.bind(this);
    this.addReplies = this.addReplies.bind(this);
    this.getOneOfNote = this.getOneOfNote.bind(this);
  }
  getAllNotes(req, res, next) {
    const form = formidable.IncomingForm();
    form.parse(req, async(err, fields, files) => {
      if (err) {
        res.send({
          status: 0,
          type: "FORM_DATA_ERROR",
          message: "表单信息错误"
        });
        return;
      }
      try {
        const {
          offset = 0, limit = 20
        } = fields;
        const notesList = await NoteModel.find({})
          .sort({
            id: -1
          }) //1升序 -1降序
          .skip(Number(offset)) //略过多少个数据
          .limit(Number(limit)); //限制多少条;
        res.send({
          status: 200,
          type: "SUCCESS_GET_NOTES",
          message: "查询note成功",
          data: notesList
        });
      } catch (err) {
        res.send({
          status: 0,
          type: "ERROR_GET_NOTES",
          message: "查询文档列表失败"
        });
      }
    });
  }
  getNotes(req, res, next) {
    const form = new formidable.IncomingForm();
    form.parse(req, async(err, fields, files) => {
      if (err) {
        res.send({
          status: 0,
          type: "FORM_DATA_ERROR",
          message: "表单信息错误"
        });
        return;
      }
      const {
        encrypUserId
      } = fields;
      try {
        if (!encrypUserId) {
          throw new Error("userID不能为空");
        }
      } catch (err) {
        console.log(err.message, err);
        res.send({
          status: 0,
          type: "GET_ERROR_PARAM",
          message: err.message
        });
        return;
      }
      try {
        const decryptionUser_id = this.decryptionDatagram(encrypUserId);
        const uesr_notes_find = await NoteModel.findOne({
          user_id: decryptionUser_id
        });
        if (uesr_notes_find) {
          res.send({
            status: 200,
            type: "NOTES_FIND_SUCCESS",
            message: "note查询成功",
            notes: uesr_notes_find
          });
        } else {
          res.send({
            status: 0,
            type: "NOTES_FIND_FAIL",
            message: "note查询失败"
          });
        }
      } catch (err) {
        console.log(err.message, err);
        res.send({
          status: 0,
          type: "NOTES_FIND_ERROR",
          message: err.message
        });
        return;
      }
    });
  }
  getOneOfNote(req, res, next) {
    const form = new formidable.IncomingForm();
    form.parse(req, async(err, fields, files) => {
      if (err) {
        res.send({
          status: 0,
          type: "FORM_DATA_ERROR",
          message: "表单信息错误"
        });
        return;
      }
      const {
        encrypUserId,
        note_id
      } = fields;
      try {
        if (!encrypUserId) {
          throw new Error("author_id不能为空");
        } else if (!note_id) {
          throw new Error("note_id不能为空");
        }
      } catch (err) {
        console.log(err.message, err);
        res.send({
          status: 0,
          type: "GET_ERROR_PARAM",
          message: err.message
        });
        return;
      }
      try {
        const decryptionUser_id = this.decryptionDatagram(encrypUserId);
        const uesr_notes_find = await NoteModel.findOne({
          user_id: decryptionUser_id
        });
        if (uesr_notes_find) {
          const note = uesr_notes_find.notes.filter((item, index) => {
            if (item.note_id === note_id) {
              return true;
            } else {
              return false;
            }
          })
          if (note) {
            res.send({
              status: 200,
              type: "NOTES_FIND_SUCCESS",
              message: "note查询成功",
              notes: {
                ...note[0]._doc,
                user_id: decryptionUser_id,
                author_id: uesr_notes_find.user_id,
                author_nickname: uesr_notes_find.nickname,
                author_avatar: uesr_notes_find.avatar_url
              }
            });
          } else {
            res.send({
              status: 0,
              type: "NOTES_FIND_ERROR",
              message: "note查询失败"
            });
          }
        }
      } catch (err) {
        console.log(err.message, err);
        res.send({
          status: 0,
          type: "NOTES_FIND_ERROR",
          message: err.message
        });
        return;
      }
    });
  }
  addNote(req, res, next) {
    const form = new formidable.IncomingForm();
    form.parse(req, async(err, fields, files) => {
      if (err) {
        res.send({
          status: 0,
          type: "FORM_DATA_ERROR",
          message: "表单信息错误"
        });
        return;
      }
      const {
        encrypUserId,
        avatar_url = "",
        nickname,
        note_title,
        note_content
      } = fields;
      try {
        if (!encrypUserId || !note_title || !note_content || !nickname) {
          throw new Error("输入不能为空");
        }
      } catch (err) {
        console.log(err.message, err);
        res.send({
          status: 0,
          type: "GET_ERROR_PARAM",
          message: err.message
        });
        return;
      }
      try {
        const decryptionUser_id = this.decryptionDatagram(encrypUserId);
        const ifcreate = await NoteModel.findOne({
          user_id: decryptionUser_id
        });
        if (ifcreate) {
          const find_notes = await NoteModel.findOne({
            user_id: decryptionUser_id,
            "notes.note_title": note_title
          });
          if (!find_notes) {
            const newNote = {
              note_id: encrypUserId + note_title,
              note_title: note_title,
              note_content: note_content,
              create_time: timeformate().format("YYYY-MM-DD HH:mm:ss"),
              opennum: 0,
              replies: []
            };
            ifcreate.notes.push(newNote);
            const update = await NoteModel.update(ifcreate);
            if (update) {
              res.send({
                status: 200,
                type: "NOTES_FOUND_SUCCESS",
                message: "该文章创建成功"
              });
            } else {
              res.send({
                status: 0,
                type: "NOTES_FOUND_FAIL",
                message: "该文章创建失败"
              });
            }
          } else {
            res.send({
              status: 0,
              type: "NOTES_EXIS",
              message: "该文章已经存在"
            });
          }
        } else {
          const create_notes = await NoteModel.create({
            user_id: decryptionUser_id,
            avatar_url: avatar_url,
            nickname: nickname,
            notes: [{
              note_id: encrypUserId + note_title,
              note_title: note_title,
              note_content: note_content,
              create_time: timeformate().format("YYYY-MM-DD HH:mm:ss"),
              opennum: 0,
              replies: []
            }]
          });
          if (create_notes) {
            res.send({
              status: 200,
              type: "NOTES_FOUND_SUCCESS",
              message: "该文章创建成功"
            });
          } else {
            res.send({
              status: 0,
              type: "NOTES_FOUND_FAIL",
              message: "该文章创建失败"
            });
          }
        }
      } catch (err) {
        console.log(err.message, err);
        res.send({
          status: 0,
          type: "NOTES_FOUND_ERROR",
          message: err.message
        });
        return;
      }
    });
  }
  addReplies(req, res, next) {
    const form = new formidable.IncomingForm();
    form.parse(req, async(err, fields, files) => {
      if (err) {
        res.send({
          status: 0,
          type: "FORM_DATA_ERROR",
          message: "表单信息错误"
        });
        return;
      }
      const {
        encrypAuthorId,
        encrypUserId,
        note_id,
        nickname,
        content,
      } = fields;
      console.log(files)
      try {
        if (!encrypAuthorId || !note_id || !nickname || !encrypUserId || !content) {
          throw new Error("输入不能为空");
        }
      } catch (err) {
        console.log(err.message, err);
        res.send({
          status: 0,
          type: "GET_ERROR_PARAM",
          message: err.message
        });
        return;
      }
      const decryptionUser_id = this.decryptionDatagram(encrypUserId);
      const decryptionAuthor_id = this.decryptionDatagram(encrypAuthorId);
      try {
        const find_notes = await NoteModel.findOne({
          user_id: decryptionAuthor_id
        });
        if (find_notes) {
          find_notes.notes.map(async(note, index) => {
            if (note.note_id === note_id) {
              note.replies.push({
                nickname: nickname,
                content: content,
                create_at: timeformate().format("YYYY-MM-DD HH:mm:ss"),
                ups: []
              })
              if (index === find_notes.notes.length - 1) {
                const updateResult = await NoteModel.update(find_notes);
                console.log(updateResult);
                if (updateResult.ok > 0) {
                  res.send({
                    status: 200,
                    type: "NOTES_UPDATE_SUCCESS",
                    message: "评论成功"
                  });
                } else {
                  res.send({
                    status: 0,
                    type: "NOTES_UPDATE_ERROR",
                    message: "评论失败"
                  });
                }
                return;
              }
            }
          })
        } else {
          console.log(err.message, err);
          res.send({
            status: 0,
            type: "NOTES_FOUND_ERROR",
            message: err.message
          });
          return;
        }
      } catch (err) {
        console.log(err.message, err);
        res.send({
          status: 0,
          type: "NOTES_FOUND_ERROR",
          message: err.message
        });
        return;
      }
    });
  }
  async deleteNOTES(req, res, next) {
    const form = new formidable.IncomingForm();
    form.parse(req, async(err, fields, files) => {
      if (err) {
        res.send({
          status: 0,
          type: "FORM_DATA_ERROR",
          message: "表单信息错误"
        });
        return;
      }
      const {
        id
      } = fields;
      try {
        if (!id) {
          throw new Error("输入id不能为空");
        }
      } catch (err) {
        console.log(err.message, err);
        res.send({
          status: 0,
          type: "GET_ERROR_PARAM",
          message: err.message
        });
        return;
      }
      try {
        const delete_NOTESs = await NoteModel.remove({
          _id: id
        });
        console.log(delete_NOTESs.result);
        if (delete_NOTESs.result.ok > 0) {
          console.log("删除成功");
          res.send({
            status: 200,
            type: "NOTES_DELETE_SUCCERR",
            message: "删除成功"
          });
        } else {
          res.send({
            status: 0,
            type: "NOTES_DELETE_ERROR",
            message: "删除失败"
          });
        }
      } catch (err) {}
    });
  }
  async updateNOTES(req, res, next) {
    const form = new formidable.IncomingForm();
    form.parse(req, async(err, fields, files) => {
      if (err) {
        res.send({
          status: 0,
          type: "FORM_DATA_ERROR",
          message: "表单信息错误"
        });
        return;
      }
      const {
        id,
        name,
        knowledges
      } = fields;
      try {
        if (!name) {
          throw new Error("文档名不能为空");
        } else if (!knowledges) {
          throw new Error("文档不能为空");
        } else if (!id) {
          throw new Error("传入文档id为空");
        }
      } catch (err) {
        console.log(err.message, err);
        res.send({
          status: 0,
          type: "GET_ERROR_PARAM",
          message: err.message
        });
        return;
      }
      try {
        const find_NOTESs = await NoteModel.findOne({
          _id: id
        });
        if (find_NOTESs) {
          let flage = false;
          // 判断是否有此元素
          let filt_doc = await find_NOTESs.knowledges.map(item => {
            if (item.name === name) {
              flage = true;
              return;
            }
          });
          console.log(flage);
          if (flage) {
            res.send({
              status: 0,
              type: "UPDATE_ERROR",
              message: "已有此条笔记，不能重复插入"
            });
          } else {
            find_NOTESs.knowledges.push({
              name: name,
              knowledges: knowledges
            });
            const add_Doc = await NoteModel.update({
              _id: id
            }, find_NOTESs);
            if (add_Doc.ok > 0) {
              res.send({
                status: 0,
                type: "NOTES_UPDATE_SUCCESS",
                message: "更新成功"
              });
            } else {
              res.send({
                status: 0,
                type: "NOTES_UPDATE_ERROR",
                message: "更新失败"
              });
            }
          }
        } else {
          console.log("没有找到对应的文档");
          res.send({
            status: 0,
            type: "NOTES_NOT_FIND",
            message: "没有找到对应的文档"
          });
        }
      } catch (err) {
        console.log(err.message, err);
        res.send({
          status: 0,
          type: "NOTES_ADD_ERROR",
          message: err.message
        });
        return;
      }
    });
  }
  // user_id解密
  decryptionDatagram(
    encrypted,
    algorithm = "aes-256-cbc",
    key = "9450B9F72916181DBFE7ACE8E14C02A0" //秘钥
  ) {
    var decrypted = "";
    var decipher = crypto.createDecipher(algorithm, key);
    decrypted += decipher.update(encrypted, "hex", "binary");
    decrypted += decipher.final("binary");
    return JSON.parse(decrypted);
  }
}
export default new CTL_Note();