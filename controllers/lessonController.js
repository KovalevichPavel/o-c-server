const {Lesson, AnswerOption, LessonStatus, Section, Guide} = require('../models/models')
const ApiError = require('../error/ApiError')
const { Op } = require('sequelize');

class LessonController {    
    async create(req, res, next) {
        try {
            const { typeLesson, title, content, condition, answerOption} = req.body; // sectionId

            const lastSectionId = await Section.max('id');
            const lastSection = await Section.findOne({ where: { id: lastSectionId } });

            if (!lastSection) {
                return res.status(404).json({ error: "Section not found" });
            }       
    
            const newLesson = await Lesson.create({
                typeLesson,
                title,
                content,
                condition,
                answerOptions: answerOption.map(option => ({ optionText: option.optionText, isCorrect: option.isCorrect }))
            }, { include: AnswerOption });

            await newLesson.setSection(lastSectionId);
    
            return res.json(newLesson);
        } catch(e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async createStatus(req, res, next) {        
        try {
            const { id } = req.params;
            const { currentUser } = req.body;

            const currentLesson = await Lesson.findOne({ where: { id: id } });

            if (!currentLesson) {
                return res.status(404).json({ error: "Lesson not found" });
            }            

            const newLessonStatus = await LessonStatus.create({
                status: 1,
            });
    
            await newLessonStatus.setUser(currentUser.id);
            await newLessonStatus.setLesson(currentLesson);

            return res.status(200).json({ message: "Lesson status created successfully" });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: "An error occurred while creating the lesson status" });
        }
    }

    async createStatusForNew(req, res, next) {        
        try {
            let id = 1;
            let isFinished = false
            let { currentUser, maxSectionId, percentsCompleted } = req.body;

            if (percentsCompleted < 30) {
                return res.status(200).json({ message: "Lessons statuses weren't created, too low knowledge" });
            } else if (percentsCompleted >= 30 && percentsCompleted <= 70) {
                maxSectionId -= 1;
            }

            while (!isFinished) {
                const currentLesson = await Lesson.findOne({ where: { id: id } });

                if (!currentLesson) {                    
                    isFinished = true;
                    continue;
                }        

                if (maxSectionId < currentLesson.sectionId) {
                    return res.status(200).json({ message: "Lessons statuss created successfully" });
                }                    
    
                const newLessonStatus = await LessonStatus.create({
                    status: 1,
                });
        
                await newLessonStatus.setUser(currentUser.id);
                await newLessonStatus.setLesson(currentLesson);

                id += 1;
            }                 
            return res.status(200).json({ message: "Lessons statuss created successfully" });       
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: "An error occurred while creating the lesson status" });
        }
    }

    async createSection(req, res, next) {
        try {
            const { topic } = req.body;
            const lastSectionId = await Section.max('id');
    
            const newSection = await Section.create({
                name: "Раздел " + (+lastSectionId + 1),
                topic,
                guide: { title: "Title - No info...", content: "Content - No info..." }
            }, { include: Guide });
    
            return res.json(newSection);
        } catch(e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async changeLesson(req, res, next) {
        try {
            const { id } = req.params;
            const { title, content, condition, answerOptions } = req.body;
            
            const lesson = await Lesson.findByPk(id, {
                include: [{ model: AnswerOption }],
            });
        
            if (!lesson) {
                return next(ApiError.notFound(`Lesson with ID ${id} not found`));
            }
        
            lesson.title = title;
            lesson.content = content;
            lesson.condition = condition;     

            answerOptions.forEach(async (option) => {
                const answerOption = lesson.answerOptions.find((ao) => ao.id === option.id);
                if (answerOption) {
                    answerOption.optionText = option.optionText;
                    await answerOption.save();
                }
            });  
        
            await lesson.save();
        
            return res.json(lesson);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }    
    
    async getAllSections(req, res) {
        try {      
          const sections = await Section.findAll({
            attributes: ["name", "topic", "id"],
            include: [
              {
                model: Guide,
                attributes: ["title", "content"],                
              },
            ],
          });
      
          return res.json(sections);
        } catch (error) {
          console.error(error);
          return res.status(500).json({ error: 'error - ' + error});
        }        
      }

      async getAll(req, res) {
        try {
          const { userId, lessonType } = req.query;
      
          const lessons = await Lesson.findAll({
            attributes: ["id", "typeLesson", "title", "sectionId"],
            include: [
              {
                model: LessonStatus,
                attributes: ["status", "userId", "lessonId"],
                where: { userId },
                required: lessonType === undefined ? false : true,
              },
            ],
            where: lessonType !== undefined ? { typeLesson: lessonType } : {},
          });
      
          return res.json(lessons);
        } catch (error) {
          console.error(error);
          return res.status(500).json({ error: 'error - ' + error});
        }
      }

      async getSortedSections(req, res) {
        try {
          const { isToCheckHTML, isToCheckCSS } = req.query;
          console.log(isToCheckHTML)
          console.log(isToCheckCSS)
      
        const sectionFilter = {};
        if (isToCheckHTML === 'true') {
            sectionFilter.topic = { [Op.like]: '%HTML%' };
          }
      
          if (isToCheckCSS === 'true') {
            if (sectionFilter.topic) {
              sectionFilter.topic = { [Op.or]: [sectionFilter.topic, { [Op.like]: '%CSS%' }] };
            } else {
              sectionFilter.topic = { [Op.like]: '%CSS%' };
            }
          }
      
           const sections = await Section.findAll({
             attributes: ["id", "topic"],
             where: sectionFilter,
             include: [
                {
                  model: Lesson,
                  attributes: ["id", "typeLesson", "title", "condition", "SectionId"],
                  where: {typeLesson: 2},
                  include: [
                    { 
                        model: AnswerOption,
                        attributes: ["id", "optionText", "isCorrect"],
                    }
                  ],
                },
              ],
           });
      
           return res.json(sections);
         } catch (error) {
           return res.status(500).json({ error: 'error - ' + error});
         }
      }
    
    async getOne(req, res) {
        const { id } = req.params;
        const { userId } = req.query;

        const lesson = await Lesson.findOne({
            where: { id },
            include: [
                { model: AnswerOption },
                { 
                    model: LessonStatus,
                    where: { userId },
                    required: false, 
                },
            ],          
        });
        return res.json(lesson);
    }   

    async getOneGuide(req, res) {
        try {
            const { id } = req.params;
    
            const guide = await Guide.findOne({where: { id },});
            return res.json(guide);
        } catch (e) {
            console.error(error);
            return res.status(500).json({ error: 'error - ' + error});
        }
    }

    async changeGuide(req, res) {
        try {
            const { id } = req.params;
            const { title, content } = req.body;
            
            const guide = await Guide.findByPk(id);
        
            if (!guide) {
                return next(ApiError.notFound(`Guide with ID ${id} not found`));
            }
        
            guide.title = title;
            guide.content = content;
        
            await guide.save();
        
            return res.json(guide);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }
}   

module.exports = new LessonController();