exports.orderAssign = (result) => {
  let rows = [];
  let rows2 = [];

  // Agrupamos por learningPlan
  result.forEach((e) => {
    if (rows[e.idLp]) {
      rows[e.idLp].courses.push({
        idCourse: e.idCourse,
        nameCourse: e.nameCourse,
        isPrivate: e.isPrivate,
        urlImgCourse: e.urlImgCourse,
        orderCourse: e.orderCourse,
        statusCourse: e.StatusCourse,
        descriptionCourse: e.descriptionCourse,
        advanceAgent: e.advanceAgent,
      });
    }

    if (!rows[e.idLp]) {
      rows[e.idLp] = {
        idLp: e.idLp,
        nameLearningPlan: e.nameLearningPlan,
        descriptionLearningPlan: e.descriptionLearningPlan,
        statusLp: e.StatusLp,
        agent: e.Agent,
        idEmployee: e.idEmployee,
        courses: [
          {
            idCourse: e.idCourse,
            nameCourse: e.nameCourse,
            isPrivate: e.isPrivate,
            urlImgCourse: e.urlImgCourse,
            orderCourse: e.orderCourse,
            statusCourse: e.StatusCourse,
            descriptionCourse: e.descriptionCourse,
            advanceAgent: e.advanceAgent,
          },
        ],
      };
    }
  });

  // removemos los null del array
  rows.forEach((el) => {
    rows2.push(el);
  });

  let learningPlanWcoursesOrdered = rows2.map((lp) => {
    // Ordenamos las actividades por la columna orderActivity
    let sortedCourses = lp.courses.sort((r1, r2) =>
      r1.orderCourse > r2.orderCourse
        ? 1
        : r1.orderCourse < r2.orderCourse
        ? -1
        : 0
    );

    lp.courses = sortedCourses;
    return lp;
  });

  return learningPlanWcoursesOrdered;
};
