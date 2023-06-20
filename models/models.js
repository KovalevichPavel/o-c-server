const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true},
    email: {type: DataTypes.STRING, unique: true},
    password: {type: DataTypes.STRING},
    dateRegistration: {type: DataTypes.DATE, defaultValue: DataTypes.NOW},
    role: {type: DataTypes.STRING, defaultValue: "USER"},
});

const Progress = sequelize.define('progress', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},    
    score: {type: DataTypes.INTEGER},
})

const Lesson = sequelize.define('lesson', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},   
    typeLesson: {type: DataTypes.INTEGER},
    title: {type: DataTypes.STRING(200)},
    content: {type: DataTypes.TEXT},
    condition: {type: DataTypes.TEXT},
})

const LessonStatus = sequelize.define('lessonStatus', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    status: {type: DataTypes.INTEGER, defaultValue: 1},
});

const AnswerOption = sequelize.define('answerOption', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    optionText: {type: DataTypes.TEXT, allowNull: false},
    isCorrect: {type: DataTypes.BOOLEAN, allowNull: false},
}); 

const Section = sequelize.define('section', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING},
    topic: {type: DataTypes.STRING}
});

const Guide = sequelize.define('guide', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING},
    content: {type: DataTypes.TEXT}
});

User.hasOne(Progress)
Progress.belongsTo(User)

Lesson.hasMany(AnswerOption);

Lesson.hasMany(LessonStatus);
LessonStatus.belongsTo(Lesson);

User.hasMany(LessonStatus);
LessonStatus.belongsTo(User);

Section.hasMany(Lesson);
Lesson.belongsTo(Section);

Section.hasOne(Guide);
Guide.belongsTo(Section);

module.exports = {
    User, Progress, Lesson, LessonStatus, AnswerOption, Section, Guide
}