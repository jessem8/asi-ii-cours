# Notes

- English explanations. Keep French course terms and write lab statements in the professor's French ("Travail à faire").
- He types code himself in the real lab. The site may show full solutions behind a reveal; it must not write into `C:\Users\jesse\IdeaProjects\tpfoyer`.
- He loses focus on long passive text. Short sections, click to reveal, instant feedback.
- Quiz options: same number of words so length never gives the answer away.
- Code style matches `tp-foyer-solution`: `@Getter @Setter @AllArgsConstructor @NoArgsConstructor`, never `@Data` on entities; `@Service @AllArgsConstructor`; `@RestController @AllArgsConstructor @RequestMapping`; `findById(id).get()` as the slides do.
- `@JsonIgnore` import that compiled on this machine: `com.fasterxml.jackson.annotation.JsonIgnore`, on the mappedBy side.
- Boot 4 writes `spring-boot-starter-webmvc`. Slides say JDK 17 and older Boot. That difference is expected.
- MAMP password is root. Do not print it in the pages. Say "the MAMP MySQL password".
